'use strict';

const {operator} = require('putout');

const {
    remove,
    compareAny,
} = operator;

const REQUIRE_LIST = [
    'const __a = require(__b)',
    'const __a = require(__b)(__args)',
    'const __a = require(__b).__c',
];

module.exports.report = ({path}) => {
    const idPath = path.get('declarations.0.id');
    const id = String(idPath).replace(/\s+/g, '');
    
    return `Declare '${id}' after last 'require()'`;
};

module.exports.fix = ({path, firstRequire, lastRequire}) => {
    const {node} = path;
    const {comments} = path.node;
    
    delete node.loc;
    node.__putoutNodeDeclareAfterRequire = true;
    
    if (comments) {
        firstRequire.node.comments = comments;
        delete path.node.comments;
    }
    
    remove(path);
    lastRequire.insertAfter(node);
};

module.exports.traverse = ({push, listStore}) => ({
    'const __a = __b': (path) => {
        if (!path.parentPath.isProgram())
            return;
        
        listStore(path);
    },
    'Program': {
        exit() {
            const requirePaths = [];
            const constPaths = [];
            
            for (const path of listStore()) {
                if (!path.node)
                    continue;
                
                if (path.node.__putoutNodeDeclareAfterRequire)
                    continue;
                
                if (path.node.declarations[0].id.name === 'require')
                    continue;
                
                if (compareAny(path, REQUIRE_LIST)) {
                    requirePaths.push(path);
                    continue;
                }
                
                constPaths.push(path);
            }
            
            if (!requirePaths.length)
                return;
            
            const firstRequire = requirePaths.at(0);
            const lastRequire = requirePaths.at(-1);
            
            if (!lastRequire.node.loc)
                return;
            
            const lastRequireLine = lastRequire.node.loc.end.line;
            
            for (const path of constPaths) {
                const {loc} = path.node;
                const line = !loc ? 0 : loc.start.line;
                
                if (line < lastRequireLine && lastRequireLine < getReferenceLine(path, constPaths)) {
                    push({
                        path,
                        firstRequire,
                        lastRequire,
                    });
                }
            }
        },
    },
});

function getName(path) {
    const idPath = path.get('declarations.0.id');
    
    if (idPath.isIdentifier())
        return idPath.node.name;
    
    if (idPath.isObjectPattern() && idPath.node.properties.length)
        return idPath.node.properties[0].key.name;
    
    return null;
}

function getReferenceLine(path, constPaths) {
    const name = getName(path);
    const binding = path.scope.bindings[name];
    
    if (!binding)
        return -1;
    
    const {referencePaths} = binding;
    
    if (!referencePaths.length)
        return Infinity;
    
    if (compareAny(referencePaths[0], constPaths))
        return Infinity;
    
    return referencePaths[0].node.loc.start.line;
}

