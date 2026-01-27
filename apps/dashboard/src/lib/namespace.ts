export function getNamespace(): string {
  return process.env.NAMESPACE || 'crawling-jobs';
}
