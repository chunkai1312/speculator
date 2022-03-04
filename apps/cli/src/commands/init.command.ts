import { Command, CommandRunner, Option } from 'nest-commander';

interface InitCommandOptions {
  from?: string;
  to?: string;
}

@Command({ name: 'init', description: 'A parameter parse' })
export class InitCommand implements CommandRunner {
  constructor() {}

  async run(
    passedParam: string[],
    options?: InitCommandOptions
  ): Promise<void> {
    // if (options?.boolean !== undefined && options?.boolean !== null) {
    //   this.runWithBoolean(passedParam, options.boolean);
    // } else if (options?.number) {
    //   this.runWithNumber(passedParam, options.number);
    // } else if (options?.string) {
    //   this.runWithString(passedParam, options.string);
    // } else {
    //   this.runWithNone(passedParam);
    // }
  }

  // @Option({
  //   flags: '-n, --number [number]',
  //   description: 'A basic number parser'
  // })
  // parseNumber(val: string): number {
  //   return Number(val);
  // }

  // @Option({
  //   flags: '-s, --string [string]',
  //   description: 'A string return'
  // })
  // parseString(val: string): string {
  //   return val;
  // }

  // @Option({
  //   flags: '-b, --boolean [boolean]',
  //   description: 'A boolean parser'
  // })
  // parseBoolean(val: string): boolean {
  //   return JSON.parse(val);
  // }

  // runWithString(param: string[], option: string): void {
  //   this.logService.log({ param, string: option });
  // }

  // runWithNumber(param: string[], option: number): void {
  //   this.logService.log({ param, number: option });
  // }

  // runWithBoolean(param: string[], option: boolean): void {
  //   this.logService.log({ param, boolean: option });
  // }

  // runWithNone(param: string[]): void {
  //   this.logService.log({ param });
  // }
}
