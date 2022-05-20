import {CommandTrigger} from "../constant";

export function addBulletSlashCommand(text: string, description: string): string {
    return `* \`/${CommandTrigger} ${text}\` - ${description}`;
}

export function h5(text: string): string {
    return `##### ${text}\n`;
}

export function joinLines(...lines: string[]): string {
    return lines.join('\n');
}

export function bold(text: string): string {
    return `**${text}**`
}
