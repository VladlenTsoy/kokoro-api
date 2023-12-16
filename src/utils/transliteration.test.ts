import {transliteration} from "./transliteration"

describe("Transliteration function", () => {
    it("should transliterate Russian text to Latin characters", () => {
        const russianText = "Привет, мир!"
        const expectedTransliteration = "Privet, mir!"

        const result = transliteration(russianText)

        expect(result).toEqual(expectedTransliteration)
    })
})
