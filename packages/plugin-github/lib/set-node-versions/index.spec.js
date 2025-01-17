'use strict';

const {createTest} = require('@putout/test');
const setNodeVersion = require('.');

const test = createTest(__dirname, {
    'github/set-node-version': setNodeVersion,
});

test('plugin-github: set node versions: report', (t) => {
    t.report('github', 'Latest version of node is missing');
    t.end();
});

test('plugin-github: set node versions: transform', (t) => {
    t.transform('github');
    t.end();
});

test('plugin-github: set node versions: no transform: no version', (t) => {
    t.noTransform('no-version');
    t.end();
});

