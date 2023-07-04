/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade";
import { IRuleMappings } from "../../src/backend/types";

describe("Sentence Generation", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.
    jest.setTimeout(30000);

    /**
     * Remove occurrences of known strings that are inserted at non-deterministic positions.
     *
     * @param sentence The sentence to filter.
     * @returns The filtered sentence.
     */
    const filter = (sentence: string): string => {
        sentence = sentence.replace(/12345/g, "");
        sentence = sentence.replace(/54321/g, "");
        sentence = sentence.replace(/DEADBEEF/g, "");
        sentence = sentence.replace(/Mike/g, "");
        sentence = sentence.replace(/John/g, "");
        sentence = sentence.replace(/Mary/g, "");
        sentence = sentence.replace(/µπåƒ/g, "");
        sentence = sentence.replace(/você/g, "");
        sentence = sentence.replace(/𑃖𓂷/g, "");
        sentence = sentence.replace(/𑃖ꫪ𝚫/g, "");
        sentence = sentence.replace(/𑃖𠦄𣛯𪃾/g, "");
        sentence = sentence.replace(/𑃖പửၒ/g, "");
        sentence = sentence.replace(/𑃖ᚱꙍ𒅍/g, "");
        sentence = sentence.replace(/red/g, "");
        sentence = sentence.replace(/green/g, "");
        sentence = sentence.replace(/blue/g, "");
        sentence = sentence.replace(/[0-9{},.:]/g, "");

        return sentence.trim();
    };

    beforeAll(async () => {
        let result = await backend.generate("grammars/OracleAntlr.g4", {
            outputDir: "generated-sentence",
            language: "CSharp",
            alternativeJar: "antlr/antlr-4.9.2-complete.jar",
        });

        for (const file of result) {
            const diagnostics = backend.getDiagnostics(file);
            if (diagnostics.length > 0) {
                if (diagnostics[0].message.includes("no non-fragment rules")) {
                    diagnostics.shift();
                } else {
                    console.log("Generation error: " + diagnostics[0].message);
                }
            }
            expect(diagnostics).toHaveLength(0);
        }
    });

    it("Generation with mixed definition values", () => {
        const ruleMappings: IRuleMappings = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DIGITS: "12345",
            SimpleIdentifier: ["Mike"],
            UnicodeIdentifier: ["µπåƒ", "você", "𑃖𓂷", "𑃖ꫪ𝚫", "𑃖𠦄𣛯𪃾", "𑃖പửၒ", "𑃖ᚱꙍ𒅍"],
            /* eslint-enable @typescript-eslint/naming-convention */
        };


        const tester = (rule: string, sentence: string) => {
            console.log(rule + ": " + sentence);
            fs.writeFileSync("./GeneratedSQL/" + Date.now().toString() + ".sql", sentence);
            //const errors = backend.parseTestInput("grammars/OracleAntlrParser.g4", sentence, rule);
            //expect(errors).toHaveLength(0);
        };

        //const rules = backend.getRuleList("grammars/OracleAntlr.g4")!;
        const rule: string = 'sqlInputFile';
        console.log(rule);
        backend.generateSentence("grammars/OracleAntlr.g4", rule , {
            count: 10,
            maxLexerIterations: 1,
            maxParserIterations: 1,
        }, tester.bind(this, rule));
    });

    afterAll(() => {
        backend.releaseGrammar("grammars/OracleAntlr.g4");
        //fs.rmSync("generated-sentence", { recursive: true, force: true });
    });
});
