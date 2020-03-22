'use strict';

const {generate} = require('@putout/engine-parser');

const {
    compareAny,
    compareAll,
    parseTemplate,
    isTemplate,
} = require('@putout/compare');

const maybeArray = require('../maybe-array');
const debug = require('debug')('putout:runner:template');
const generateCode = (a) => generate(a).code;

const {entries} = Object;

const log = (rule, a) => {
    debug.enabled && debug(rule, generateCode(a));
};

const exclude = ({rule, tmpl, fn, nodesExclude}) => {
    if (!nodesExclude.length)
        return {
            [tmpl]: fn,
        };
    
    const visit = wrapWithCheck({
        rule,
        fn,
        nodesExclude,
        nodesInclude: [],
    });
    
    return {
        [tmpl]: visit,
    };
};

module.exports = ({rule, visitor, options}) => {
    const parsed = [];
    const nodesExclude = maybeArray(options.exclude);
    const nodesInclude = maybeArray(options.include);
    
    for (const [tmpl, fn] of entries(visitor)) {
        if (!isTemplate(tmpl)) {
            parsed.push(exclude({
                rule,
                tmpl,
                fn,
                nodesExclude,
            }));
            continue;
        }
        
        const [node, type] = parseTemplate(tmpl);
        const visit = wrapWithCheck({
            rule,
            fn,
            nodesExclude,
            nodesInclude: [
                node,
                ...nodesInclude,
            ],
        });
        
        parsed.push({
            [type]: visit,
        });
    }
    
    return parsed;
};

module.exports._log = log;

function wrapWithCheck({rule, nodesInclude, nodesExclude, fn}) {
    return (path) => {
        log(rule, path.node);
        
        if (nodesExclude.length && compareAny(path, nodesExclude))
            return;
        
        if (nodesInclude.length && !compareAll(path, nodesInclude))
            return;
        
        fn(path);
    };
}

