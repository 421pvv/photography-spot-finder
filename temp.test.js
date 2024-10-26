/*
  This is a test test file to test that GitHub workflow for CI works correctly.

*/
import { returnNum } from "./temp.js";
describe("This should pass always", () => {
    it ("return the number passed in", () => {
        
        const N = 10;
        expect(returnNum(N)).toEqual(N);
    });
});