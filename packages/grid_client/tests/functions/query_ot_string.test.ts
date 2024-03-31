import { convertObjectToQueryString } from "../../src/helpers/utils";

describe("convertObjectToQueryString", () => {
  it("should return an empty string when given an empty object", () => {
    const obj = {};
    const queryString = convertObjectToQueryString(obj);
    expect(queryString).toEqual("");
  });

  it("should correctly convert an object with string values to a query string", () => {
    const obj = { name: "Mahmoud", age: "28", city: "Egypt" };
    const expectedQueryString = "name=Mahmoud&age=28&city=Egypt";
    const queryString = convertObjectToQueryString(obj);
    expect(queryString).toEqual(expectedQueryString);
  });

  it("should correctly convert an object with number values to a query string", () => {
    const obj = { page: 1, limit: 10 };
    const expectedQueryString = "page=1&limit=10";
    const queryString = convertObjectToQueryString(obj);
    expect(queryString).toEqual(expectedQueryString);
  });

  it("should correctly convert an object with mixed types of values to a query string", () => {
    const obj = { name: "Mahmoud", age: 28, city: "Egypt" };
    const expectedQueryString = "name=Mahmoud&age=28&city=Egypt";
    const queryString = convertObjectToQueryString(obj);
    expect(queryString).toEqual(expectedQueryString);
  });

  it("should filter out undefined values from the object", () => {
    const obj = { name: "Mahmoud", age: undefined, city: "Egypt" };
    const expectedQueryString = "name=Mahmoud&city=Egypt";
    const queryString = convertObjectToQueryString(obj);
    expect(queryString).toEqual(expectedQueryString);
  });

  it("should filter out empty string values from the object", () => {
    const obj = { name: "Mahmoud", age: "", city: "Egypt" };
    const expectedQueryString = "name=Mahmoud&city=Egypt";
    const queryString = convertObjectToQueryString(obj);
    expect(queryString).toEqual(expectedQueryString);
  });
});
