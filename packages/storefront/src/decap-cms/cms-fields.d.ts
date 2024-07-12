export type CmsField = {
  widget: 'string'
    | 'text'
    | 'markdown'
    | 'image'
    | 'file'
    | 'color'
    | 'datetime'
    | 'code'
    | 'map'
    | 'boolean'
    | 'number'
    | 'select'
    | 'object'
    | 'list'
    | 'hidden'
    | 'relation'
    | `c:${string}`,
  required?: boolean,
  multiple?: boolean,
  value_type?: string,
  fields?: Record<string, CmsField>,
  types?: Record<string, CmsField>,
} & Record<string, any>;

export type CmsFields = Record<string, CmsField>;

type CheckRequired<F extends CmsField, T> = F['required'] extends true
  ? Exclude<T, undefined>
  : T | undefined;

export type InferCmsOutput<F extends CmsFields> = {
  [I in keyof F]:
    F[I]['widget'] extends 'string'
      | 'text'
      | 'markdown'
      | 'image'
      | 'file'
      | 'color'
      | 'datetime'
      | 'code'
      | 'map'
      ? CheckRequired<F[I], string> :
    F[I]['widget'] extends 'boolean'
      ? CheckRequired<F[I], boolean> :
    F[I]['widget'] extends 'number'
      ? CheckRequired<F[I]['value_type'] extends 'int' | 'float' ? number : string> :
    F[I]['widget'] extends 'select'
      ? CheckRequired<F[I], F[I]['multiple'] extends true ? string[] : string> :
    F[I]['widget'] extends 'object'
      ? CheckRequired<F[I], InferCmsOutput<F[I]['fields']>> :
    F[I]['widget'] extends 'list'
      ? F[I]['fields'] extends undefined
        ? CheckRequired<F[I], string[]>
        : CheckRequired<F[I], InferCmsOutput<F[I]['fields']>[]>
      :
    unknow;
};
