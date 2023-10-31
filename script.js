// Motherfucker! This code sucks ass

// Lazily evaluated

// DOMParser

class Expr {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    eval() {
        return undefined;
    }
}

class Const extends Expr {
    eval() {
        return this;
    }
}

class Name extends Expr {
    constructor(value) {
        super('NAME', value);
    }

    eval() {
        return symbolTable.get(this.value);
    }
}

class Lang {
    static #parseLiteral(tag, regex, cons) {
        return input => {
            if (input.tagName != tag) {
                return null;
            }

            const matched = input.textContent.trim().match(regex);
            return matched && cons(matched);
        };
    }

    static #parseMathConstant(tag, value) {
        return input => input.tagName != tag ? null : value;
    }

    static #parseBuiltin(tag, fun) {
        return input => {
            if (input.tagName != tag) {
                return null;
            }

            return new Const('BUILTIN', { fun, args: input.children });
        };
    }

    static parsers = {
        int: this.#parseLiteral('INT', /^[+-]?\d+/, matched => new Const('INT', Number.parseInt(matched))),
        // Bro, I legit stole this from ChatGPT
        real: this.#parseLiteral('REAL', /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?/, matched => new Const('REAL', Number.parseFloat(matched))),
        bool: this.#parseLiteral('BOOL', /^(true|false)/, matched => new Const('BOOL', matched == 'true')),
        string: this.#parseLiteral('STRING', /[\s\S]?/, matched => new Const('STRING', matched)),

        name: input => {
            if (input.tagName != 'NAME') {
                return null;
            }

            const attr = input.attributes?.[0];
            return attr && new Name(attr);
        },

        pi: this.#parseMathConstant('PI', ({ type: 'REAL', value: Math.PI })),
        euler: this.#parseMathConstant('E', ({ type: 'REAL', value: Math.E })),
        phi: this.#parseMathConstant('PHI', ({ type: 'REAL', value: (Math.sqrt(5) + 1 - 2 * Math.floor(Math.random() * 2)) / 2 })),

        parseAdd: this.#parseBuiltin('ADD', null),
        parseSub: this.#parseBuiltin('SUB', null),
        parseMult: this.#parseBuiltin('MULT', null),
        parseDiv: this.#parseBuiltin('DIV', null),
        parseMod: this.#parseBuiltin('MOD', null),
        parsePow: this.#parseBuiltin('POW', null),
        parseSqrt: this.#parseBuiltin('SQRT', null),
        parseHypot: this.#parseBuiltin('HYPOT', null),
        parseMin: this.#parseBuiltin('MIN', null),
        parseMax: this.#parseBuiltin('MAX', null),

        parseAnd: this.#parseBuiltin('AND', null),
        parseOr: this.#parseBuiltin('OR', null),
        parseXor: this.#parseBuiltin('XOR', null),
    };

    static parse(input, symbolTable) {
        return Object.values(this.parsers).reduce((acc, val) => acc || val(input, symbolTable));
    }
}

console.log(Lang.parseAdd(document.body.children[0]));
