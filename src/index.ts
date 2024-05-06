export type Payload<M extends string> = {
    required?: Value<undefined, M>
    email?: Value<string, M>
    min?: Value<number, M>
    max?: Value<number, M>
    regex?: Value<string | RegExp, M>
    domain?: Value<string | RegExp, M>
    url?: Value<string | RegExp, M>
    date?: Value<string | number | Date, M>
    extra?: Value<string, M>
    extra_1?: Value<string, M>
    extra_2?: Value<string, M>
}
/**
 * List message error keys, can be extended further.
 * @param default_required Mark the target as required with default name is `__prefix__` + `default_required`, which will not allow undefined or null as a value
 * @param required Mark the target as required with specific target name, which will not allow undefined or null as a value.
 * @param required_min A minimum length limit for the target.
 * @param required_max A maximum length limit for the target.
 * @param length_invalid A required length for the specific target.
 * @param domain_invalid A domain is invalid.
 * @param phone_invalid A phone is invalid.
 * @param date_invalid A date is invalid.
 * @param url_invalid A URL is invalid.
 * @param regex_invalid A regex is invalid.
 * @param email_invalid A email is invalid.
 * @param non_nullable The target is not nullable.
 * @param non_undefined The target is not undefined.
 */
export type BaseMessage =
    | 'default_required'
    | 'required'
    | 'required_min'
    | 'required_max'
    | 'length_invalid'
    | 'domain_invalid'
    | 'phone_invalid'
    | 'date_invalid'
    | 'url_invalid'
    | 'regex_invalid'
    | 'email_invalid'
    | 'non_nullable'
    | 'non_undefined'

export type Value<T, M extends string> = {
    message: M
    value?: T
}

export type Define<T extends string, M extends string> = Record<T, Payload<M>>

/**
 * The `flattenSchemaValueWith` function takes a schema object, a key, and an optional flag, and
 * returns a flattened version of the schema values with modified keys.
 * @param schema - The `schema` parameter is an object that represents a validation schema. It should
 * have keys of type `K` and values of type `M`. The `Define` type is not defined in the code
 * snippet, so I cannot provide more specific information about its structure.
 * @param {K} key - The `key` parameter is a string that represents the key in the `schema` object that
 * you want to flatten.
 * @param [allowPrefixKey=true] - The `allowPrefixKey` parameter is a boolean value that determines
 * whether to include the prefix key in the flattened key or not. If set to `true`, the flattened key
 * will include the original key followed by a double underscore (`__`) and the message. If set to
 * `false`, only the
 * @returns The function `flattenSchemaValueWith` returns an object of type `Record<string, M>`, where
 * `M` is the type of the values in the `target` object of the `schema`.
 */
export const flattenSchemaValueWith = <K extends string, M extends string>(schema: Define<K, M>, key: K, allowPrefixKey = true) => {
    const target = schema[key as K]
    if (!target) return null
    const list = Object.entries(target)
    const entries: Record<string, M> = {}
    for (let i = 0; i < list.length; i++) {
        const [pKey, { message, value }] = list[i]
        const flattenKey = allowPrefixKey ? `${key}__${message}` : message
        const isExisted = entries[flattenKey]
        const ourKey = isExisted ? `WARNING_${key}__${message}_is_duplicated` : flattenKey
        Object.assign(entries, { [ourKey]: { [pKey]: value } })
    }
    return entries
}
/**
 * The `flattenSchemaValue` function takes a schema object and flattens it into a new object with keys
 * that combine the original keys and error messages.
 * @param schema - The `schema` parameter is an object that represents a validation schema. It has keys
 * of type `K` and values of type `M`.
 * @param {string} [prefix] - The `prefix` parameter is an optional string that is used to add a prefix
 * to the flattened keys. If a prefix is provided, it will be added to the beginning of each flattened
 * key. If no prefix is provided, the flattened keys will not have any prefix.
 * @returns The function `flattenSchemaValue` returns an object of type `Record<string, M>`, where `M`
 * is the type of the values in the input `schema` object.
 * @example
 export namespace Validator {
    export type Key = "username" | "email";
    export const Schema: Define<Key, BaseMessage> = {
      username: {
        min: { message: "required_min", value: 8 },
        max: { message: "required_max", value: 50 },
        email: { message: "required_max", value: "50" },
      },
      email: {
        min: { message: "required_min", value: 5 },
        max: { message: "required_max", value: 255 },
        email: { message: "email_invalid" },
        regex: {
          message: "regex_invalid",
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        },
      },
    };
  }
 flattenSchemaValue<Validator.Define.Key, BaseMessage>(Validator.Define.Schema)
 */
export const flattenSchemaValue = <K extends string, M extends string>(schema: Define<K, M>, prefix?: string) => {
    const keys = Object.keys(schema)
    const entries: Record<string, M> = {}
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i] as K
        const target = schema[k]
        const pList = Object.entries(target)
        for (let j = 0; j < pList.length; j++) {
            const [pKey, { message, value }] = pList[j]
            const flattenKey = flattenSchemaKey(k, message, prefix)
            let ourKey = undefined
            if (isDefaultRequiredMessage(message)) {
                ourKey = flattenKey
            } else {
                const isExisted = entries[flattenKey]
                ourKey = isExisted ? `WARNING_${flattenKey}_is_duplicated` : flattenKey
            }
            if (ourKey) Object.assign(entries, { [ourKey.toLocaleLowerCase()]: { [pKey]: value } })
        }
    }
    return entries
}

/**
 * The `flattenSchemaKey` function takes a key, message, and optional prefix, and returns a flattened
 * key by concatenating them with underscores.
 * @param {string} key - The `key` parameter is a string that represents a key in a schema. It is used
 * to identify a specific field or property in the schema.
 * @param {string} message - The `message` parameter is a string that represents the message associated
 * with the schema key.
 * @param {string} [prefix] - The `prefix` parameter is an optional parameter that represents a string
 * that will be added as a prefix to the `flattenKey`. If the `prefix` parameter is not provided, the
 * `flattenKey` will be the same as the `baseFlattenKey`.
 * @returns the value of the variable `flattenKey`.
 */
export const flattenSchemaKey = (key: string, message: string, prefix?: string) => {
    const baseFlattenKey = isDefaultRequiredMessage(message) ? message : `${key}__${message}`
    const flattenKey = prefix ? `${prefix}_${baseFlattenKey}` : baseFlattenKey
    return flattenKey.toLowerCase()
}

/**
 * The function checks if a given message is equal to 'default_required'.
 * @param {string} message - The `message` parameter is a string that represents a message.
 */
export const isDefaultRequiredMessage = (message: string) => message === 'default_required'
