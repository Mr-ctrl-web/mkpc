import { Module } from '@nestjs/common';
import { CircuitService } from 'src/track-builder/circuit.service';
import {TimeTrialController} from './time-trial.controller';

@Module({
  controllers: [TimeTrialController],
  providers: [CircuitService]
})
export class TimeTrialModule {}
