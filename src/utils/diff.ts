export class Diff {
  protected static fns = [
    Diff.handleArray,
    Diff.handleBoolean,
    Diff.handleDate,
    Diff.handleNumber,
    Diff.handleObject,
    Diff.handleString,
  ];

  public static getDiff(obj1: any, obj2: any): any {
    for (const fn of Diff.fns) {
      const result = fn(obj1, obj2);

      if (result) {
        return result;
      }
    }

    return undefined;
  }

  protected static handleArray(obj1: any, obj2: any): any {
    const result = [];

    if (obj1 instanceof Array || obj2 instanceof Array) {
      for (let index = 0; index < Math.max(obj1 ? obj1.length : 0, obj2 ? obj2.length : 0); index++) {
        for (const fn of Diff.fns) {
          result[index] = fn(obj1 ? obj1[index] : undefined, obj2 ? obj2[index] : undefined);

          if (result[index]) {
            break;
          }
        }
      }

      return result;
    }

    return undefined;
  }

  protected static handleBoolean(obj1: any, obj2: any): any {
    if (typeof obj1 === 'boolean' || typeof obj2 === 'boolean') {
      if (obj1 !== obj2) {
        return {
          previous: obj1,
          current: obj2,
        };
      }
    }

    return undefined;
  }

  protected static handleDate(obj1: any, obj2: any): any {
    if (obj1 instanceof Date || obj2 instanceof Date) {
      if (obj1 ? obj1.getTime() : null !== obj2 ? obj2.getTime() : null) {
        return {
          previous: obj1,
          current: obj2,
        };
      }
    }

    return undefined;
  }

  protected static handleNumber(obj1: any, obj2: any): any {
    if (typeof obj1 === 'number' || typeof obj2 === 'number') {
      if (obj1 !== obj2) {
        return {
          previous: obj1,
          current: obj2,
        };
      }
    }

    return undefined;
  }

  protected static handleObject(obj1: any, obj2: any): any {
    const result = {};

    if (typeof obj1 === 'object' || typeof obj2 === 'object') {
      for (const key of Diff.getObjectKeys(obj1, obj2)) {
        for (const fn of Diff.fns) {
          result[key] = fn(obj1 ? obj1[key] : undefined, obj2 ? obj2[key] : undefined);

          if (result[key]) {
            break;
          }
        }
      }

      return result;
    }

    return undefined;
  }

  protected static handleString(obj1: any, obj2: any): any {
    if (typeof obj1 === 'string' || typeof obj2 === 'string') {
      if (obj1 !== obj2) {
        return {
          previous: obj1,
          current: obj2,
        };
      }
    }

    return undefined;
  }

  protected static getObjectKeys(obj1: any, obj2: any): Array<string> {
    return (obj1 ? Object.keys(obj1) : []).concat(obj2 ? Object.keys(obj2) : []).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
  }
}
