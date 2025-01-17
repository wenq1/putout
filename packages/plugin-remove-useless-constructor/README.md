# @putout/plugin-remove-useless-constructors [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@putout/plugin-remove-useless-constructor.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@putout/plugin-remove-useless-constructor "npm"

> Wrapper classes have surprising behaviour, such as `new Boolean(false)` evaluating to `true`.
>
> (c) [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html#primitive-types-wrapper-classes)

🐊[**Putout**](https://github.com/coderaiser/putout) plugin adds ability to remove useless `constructors`. Use with [remove-useless-new](https://github.com/coderaiser/putout/tree/master/packages/plugin-remove-useless-new#readme).

## Install

```
npm i @putout/plugin-remove-useless-constructors
```

## Rule

```json
{
    "rules": {
        "remove-useless-constructors": "on"
    }
}
```

## ❌ Example of incorrect code

```js
const s = String('hello');
const b = Boolean(false);
const n = Number(5);

```

## ✅ Example of correct code

```js
const s = 'hello';
const b = false;
const n = 5;
```

## License

MIT
