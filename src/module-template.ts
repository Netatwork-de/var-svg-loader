
const runtimeModulePath = require.resolve("./runtime");

export const moduleTemplate = (markup: string) => `
import { VarSvg } from ${JSON.stringify(runtimeModulePath)};
export default new VarSvg(${JSON.stringify(markup)});
`;
