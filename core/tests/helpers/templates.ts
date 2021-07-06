const componentHeader = `import { setComponentTemplate } from '@ember/component';
import { precompileTemplate } from '@ember/template-compilation';
import templateOnlyComponent from '@ember/component/template-only';`;

export function templateOnlyComponentTemplate(
  template: string,
  imports?: Record<string, string>
): string {
  let otherImports = '';
  let options = '{ strictMode: true ';

  if (imports) {
    for (const varName in imports) {
      otherImports += `import ${varName} from '${imports[varName]}';`;
    }
    options += `, scope: {${Object.keys(imports).join(', ')}}`;
  }
  options += '}';

  return `
    ${componentHeader}
    ${otherImports}
    export default setComponentTemplate(
      precompileTemplate('${template}', ${options}),
      templateOnlyComponent()
    );
  `;
}
