const utility = require("./utility")

describe("utility.capitalize", () => {
  test("0", () => {
    expect(utility.capitalize("pen")).toBe("Pen")
  })
})