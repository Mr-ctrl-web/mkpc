import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EntityManager, FindOneOptions, In, LessThan } from 'typeorm';
import { Record } from './record.entity';
import { Ranking } from './ranking.entity';
import { CircuitService } from '../track-builder/circuit.service';
import { SearchService, EQUALITY_SEARCH } from '../search/search.service';

@Controller("/time-trial")
export class TimeTrialController {
  constructor(private em: EntityManager, private circuitService: CircuitService, private searchService: SearchService) { }

  @Post("/records/find")
  async getRecords(@Body() params) {
    const recordsPayload = await this.searchService.find({
      entity: Record,
      params,
      rules: {
        allowedFilters: {
          id: EQUALITY_SEARCH,
          circuit: EQUALITY_SEARCH,
          player: EQUALITY_SEARCH,
          class: EQUALITY_SEARCH,
          type: EQUALITY_SEARCH
        },
        allowedOrders: ["id", "date"],
        maxResults: 30
      },
      where: {
        best: 1
      },
      relations: ["player"]
    });
    const data = await Promise.all(recordsPayload.data.map(async (record) => {
      const circuit = record.type ? await this.circuitService.getCircuit(record.type, record.circuit) : undefined;
      const [circuitRecords, circuitRanking] = await Promise.all([this.em.count(Record, {
        where: {
          type: record.type,
          circuit: record.circuit,
          class: record.class,
          best: 1
        }
      }), this.em.count(Record, {
        where: {
          type: record.type,
          circuit: record.circuit,
          class: record.class,
          best: 1,
          time: LessThan(record.time)
        }
      })]);
      return {
        id: record.id,
        name: record.name,
        character: record.character,
        date: record.date,
        class: record.class,
        time: record.time,
        type: record.type,
        circuit: circuit && {
          id: circuit.id,
          name: circuit.name,
          url: this.circuitService.getUrl(circuit)
        },
        player: record.player && {
          id: record.player.id,
          name: record.player.name,
        },
        leaderboard: {
          rank: circuitRanking + 1,
          count: circuitRecords
        }
      }
    }));
    return {
      data
    }
  }

  @Get("/leaderboard")
  async getLeaderboard(@Query() params) {
    const ccFilter = +params.cc || 150;
    const leaderboard = await this.em.find(Ranking, {
      where: {
        class: ccFilter,
        player: {
          deleted: false
        }
      },
      order: {
        score: "DESC"
      },
      relations: ["player"],
      take: 20
    });
    const data = leaderboard.map((ranking) => ({
      id: ranking.player.id,
      name: ranking.player.name,
      score: ranking.score,
    }));
    return { data };
  }
}
