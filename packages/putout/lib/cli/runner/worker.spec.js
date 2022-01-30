'use strict';

const mockRequire = require('mock-require');

const test = require('supertape');
const {join} = require('path');
const stub = require('@cloudcmd/stub');

const {simpleImportDefault} = require('../simple-import');

const {
    reRequire,
    stopAll,
} = mockRequire;

test('putout: cli: runner: processor throw: raw', async (t) => {
    const name = join(__dirname, 'fixture/processor.throw');
    const throwProcessor = require('./fixture/processor-throw');
    
    mockRequire('../get-options', stub().returns({
        formatter: await simpleImportDefault('@putout/formatter-json'),
        dir: '.',
        processors: [
            ['throw-processor', throwProcessor],
        ],
    }));
    
    const {rawPlaces} = await runWorker({
        names: [name],
        currentFormat: 'json-lines',
        formatterOptions: {},
        processorRunners: [throwProcessor],
    });
    
    stopAll();
    
    const expected = [[{
        message: 'preProcess',
        position: {
            column: 1,
            line: 1,
        },
        rule: 'parser',
    }]];
    
    t.deepEqual(rawPlaces, expected);
    t.end();
});

async function runWorker(options) {
    const {
        raw = false,
        rulesdir = '',
        formatterOptions = {},
        noConfig = false,
        transform = '',
        plugins = [],
        index = 0,
        fix = false,
        processorRunners = [],
        rawPlaces = [],
        names = [],
        length = 1,
        processFile = stub(),
        log = stub(),
        currentFormat = stub(),
        write = stub(),
        exit = stub(),
        wasStop = stub(),
        isStop = stub(),
        readFile = stub().returns(''),
        writeFile = stub(),
        report = stub(),
        fileCache = getFileCache(),
    } = options;
    
    const run = reRequire('./worker.js');
    
    return await run({
        exit,
        raw,
        write,
        log,
        currentFormat,
        rulesdir,
        formatterOptions,
        noConfig,
        transform,
        plugins,
        index,
        fix,
        processFile,
        processorRunners,
        fileCache,
        rawPlaces,
        wasStop,
        isStop,
        names,
        length,
        readFile,
        writeFile,
        report,
    });
}

function getFileCache() {
    const canUseCache = stub().returns(false);
    const getPlaces = stub().returns([]);
    const reconcile = stub();
    const setInfo = stub();
    
    const fileCache = {
        canUseCache,
        getPlaces,
        reconcile,
        setInfo,
    };
    
    return fileCache;
}
