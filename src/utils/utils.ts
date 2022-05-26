export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function errorWithMessage(error: Error, message: string): string {
    return `"${message}".  ` + error.message;
}

export async function tryPromiseWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((error) => {
        console.log('error', error);
        throw new Error(errorWithMessage(error, message));
    });
}
