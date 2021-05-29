async function getSingleResult(results, args=[]) {
    if (!results.length)
        throw Error('No result matches the specified selector: "'+ args[1] +'"');
    if (results.length > 1) {
        for (const result of results)
            console.log((await result.getProperty("outerHTML"))+"");
        throw Error('More than one result for the specified selector: "'+ args[1] +'"');
    }
    return results[0];
}
function toSingleResult(fn) {
    return (...args) => fn(...args).then((res) => getSingleResult(res, args));
}
exports.getSingleResult = getSingleResult;

exports.getAllByText = async ($elt, text, options={}) => {
    const tag = options.tag || "*";
    let res;
    if (options.exact !== false)
        res = await $elt.$x('.//'+ tag +'[text() = "'+ text +'"]');
    else
        res = await $elt.$x('.//'+ tag +'[contains(., "'+ text +'")]');
    let onlyNodes = [];
    for (const elt of res) {
        const html = await elt.getProperty("innerHTML").then(h => h.jsonValue());
        if (!html.trim().startsWith("<")) // TODO this won't always work, find a cleaner way
            onlyNodes.push(elt);
    }
    return onlyNodes;
}
exports.getByText = toSingleResult(exports.getAllByText);
exports.getAllByLabelText = async ($elt, text, options) => {
    const labels = await exports.getAllByText($elt, text, {
        ...options,
        tag: "label"
    });
    var res = [];
    for (const label of labels) {
        const forAttribute = await label.evaluate(l => l.getAttribute('for'));
        let inputs;
        if (forAttribute)
            inputs = await $elt.$$("#"+forAttribute);
        else
            inputs = await label.$$("input");
        if (inputs.length)
            res.push(inputs[0]);
    }
    return res;
}
exports.getByLabelText = toSingleResult(exports.getAllByLabelText);

exports.getAllByValue = async ($elt, text, options={}) => {
    const tag = options.tag || "*";
    if (options.exact !== false)
        return $elt.$x('.//'+ tag +'[@value = "'+ text +'"]');
    else
        return $elt.$x('.//'+ tag +'[contains(@value, "'+ text +'")]');
}
exports.getByValue = toSingleResult(exports.getAllByValue);

exports.getAllLinksByText = async ($elt, text, options={}) => {
    return exports.getAllByText($elt, text, {
        ...options,
        tag: "a"
    });
}
exports.getLinkByText = toSingleResult(exports.getAllLinksByText);

exports.waitForScopedSelector = async (scopeElement, selector) => {
    const testScopeId = Math.random();
    await scopeElement.evaluate((elt,testScopeId) => elt.dataset.__testscope__ = testScopeId, testScopeId);
    return page.waitForFunction(({selector, testScopeId}) => document.querySelector("[data-__testscope__='"+ testScopeId +"'] "+ selector), {}, {selector, testScopeId});
}
exports.waitForScopedXPath = async (scopeElement, xPath) => {
    // TODO untested function
    const testScopeId = Math.random();
    await scopeElement.evaluate((elt,testScopeId) => elt.dataset.__testscope__ = testScopeId, testScopeId);
    return page.waitForFunction(({xPath, testScopeId}) => document.evaluate("//[data-__testscope__='"+ testScopeId +"']/"+ xPath), {}, {xPath, testScopeId});
}

exports.sleep = t => new Promise(resolve => setTimeout(resolve, t));