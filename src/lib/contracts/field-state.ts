export type ContractPlaceholderState = 'empty' | 'filled';

export function getContractPlaceholderState(value: string | undefined): ContractPlaceholderState {
  return hasMeaningfulContractValue(value) ? 'filled' : 'empty';
}

export function hasMeaningfulContractValue(value: string | undefined): boolean {
  if (!value) return false;

  return readableContractValue(value).length > 0;
}

export function readableContractValue(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
