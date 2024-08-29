export interface ResBase64 {
  base64: string;
  mimeType: string;
  validation: boolean;
}

function base64FormatSeparate(base64String: string): string[] {
  const pattern: RegExp = /^data:(image\/\w+);base64,([A-Za-z0-9+\/=]|\s)*$/;

  if (pattern.test(base64String)) {
    const separate: string[] = base64String.split(",");
    return separate;
  }

  return [];
}

function base64FormatValidation(base64String: string): ResBase64 | undefined {
  const pattern: RegExp = /^([A-Za-z0-9+\/=]|\s)*$/;
  const separate: string[] = base64FormatSeparate(base64String);

  if (separate.length > 0) {
    if (pattern.test(separate[1]) && separate[1].length % 4 === 0) {
      return {
        base64: separate[1],
        mimeType: separate[0].slice(5, separate[0].indexOf(";")),
        validation: true,
      };
    }
  }
}

export { base64FormatSeparate, base64FormatValidation };
