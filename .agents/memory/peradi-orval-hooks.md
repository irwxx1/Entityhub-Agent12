---
name: PERADI orval hook options
description: Gotcha — orval-generated hooks require explicit queryKey even though runtime provides a fallback
---

## Rule
When passing a `query` options object to any orval-generated hook (e.g. `useGetSuara`, `useGetStats`, `useCekPeserta`), always include `queryKey` explicitly:

```ts
useGetSuara({ query: { queryKey: getGetSuaraQueryKey(), refetchInterval: 15000 } })
```

**Why:** The generated `UseQueryOptions` type marks `queryKey` as required even though the generated `getXxxQueryOptions` helper has a `?? fallback` at runtime. TypeScript will error without it.

**How to apply:** Whenever adding `refetchInterval`, `enabled`, or any other `query` option to an orval hook, import and pass the corresponding `getXxxQueryKey()` function alongside it.
