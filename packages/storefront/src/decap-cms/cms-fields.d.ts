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
    | `select:${string}`
    | 'object'
    | 'list'
    | 'hidden'
    | 'relation'
    | `c:${string}`,
  required?: boolean,
  multiple?: boolean,
  value_type?: string,
  fields?: Record<string, CmsField> | null,
  types?: Record<string, CmsField>,
  label?: string | Record<string, string>,
  _dropped?: true,
  _nullable?: true,
} & Record<string, any>;

export type CmsFields = Record<string, CmsField>;

/* eslint-disable no-use-before-define */
export type InferCmsFieldOutput<F extends CmsField> =
  F['widget'] extends 'string'
    | 'text'
    | 'markdown'
    | 'image'
    | 'file'
    | 'color'
    | 'datetime'
    | 'code'
    | 'map'
    ? string
    :
  F['widget'] extends 'boolean'
    ? boolean
    :
  F['widget'] extends 'number'
    ? F['value_type'] extends 'int' | 'float' ? number : string
    :
  F['widget'] extends 'select'
    | `select:${string}`
    ? F['multiple'] extends true ? string[] : string
    :
  F['widget'] extends 'object'
    ? InferCmsOutput<F['fields']>
    :
  F['widget'] extends 'list'
    ? F['fields'] extends undefined | null
      ? string[]
      : InferCmsOutput<F['fields']>[]
    :
  unknow;

export type InferCmsOutput<FS extends CmsFields> = {
  [I in keyof FS as FS[I]['required'] extends true ? I : never]:
    FS[I]['_dropped'] extends true ? never : InferCmsFieldOutput<FS[I]>;
} & {
  [I in keyof FS as FS[I]['required'] extends true ? never : I]?:
    FS[I]['_dropped'] extends true
      ? never
      : FS[I]['_nullable'] extends true
        ? InferCmsFieldOutput<FS[I]> | null
        : InferCmsFieldOutput<FS[I]>;
};

export type CmsComponent = Partial<Omit<CmsField, 'widget'>> & {
  label: string | Record<string, string>,
  fields?: CmsFields,
};

export type CmsConfigExtend = {
  components: {
    hero: CmsComponent,
    sections: Record<string, CmsComponent & {
      summary?: string | Record<string, string>,
    }>,
  },
  mergeConfig?: Record<string, any>;
};
