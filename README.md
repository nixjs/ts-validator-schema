# @nixjs23n6/ts-validator-schema

Typescript - Create message error keys and parameters and flatten message keys in Schema of JavaScript Validation Libraries (Zod, Yup, Zoi). 

## Install

```shell [npm]
npm install @nixjs23n6/ts-validator-schema
```

```shell [pnpm]
pnpm add @nixjs23n6/ts-validator-schema
```

```shell [yarn]
yarn add @nixjs23n6/ts-validator-schema
```

```shell [bun]
bun add @nixjs23n6/ts-validator-schema
```

## Example

```typescript
import { BaseMessage, Define, flattenSchemaValue } from '@athena20/ts-validator-schema'
import * as z from 'zod'

namespace ValidatorConfig {
    export const BaseMessageErrorPrefix = 'msg_error'
    export type Key = 'username' | 'email' | 'password' | 'confirmPassword' | 'oldPassword'
    export type Message = BaseMessage | 'passwords_cannot_be_the_same' | 'passwords_must_be_match' | 'email_regex_invalid' | 'email_existed'
    export const Schema: Define<Key, Message> = {
        username: {
            required: { message: 'default_required' },
            min: { message: 'required_min', value: 8 },
            max: { message: 'required_max', value: 50 },
            regex: {
                message: 'regex_invalid',
                value: /^[a-zA-Z0-9]*$/
            }
        },
        oldPassword: { required: { message: 'default_required' }, min: { message: 'required_min', value: 6 } },
        password: {
            required: { message: 'default_required' },
            min: { message: 'required_min', value: 6 },
            max: { message: 'required_max', value: 20 },
            regex: { message: 'regex_invalid', value: /^[a-zA-Z0-9`!@#$%^&*()_+\-=\\[\]{};:"|,.<>?~']+$/ },
            extra: {
                message: 'passwords_cannot_be_the_same'
            }
        },
        confirmPassword: {
            required: { message: 'default_required' },
            min: { message: 'required_min', value: 6 },
            max: { message: 'required_max', value: 20 },
            extra: {
                message: 'passwords_must_be_match'
            }
        },
        email: {
            required: { message: 'default_required' },
            min: { message: 'required_min', value: 5 },
            max: { message: 'required_max', value: 255 },
            email: { message: 'email_invalid' },
            extra: { message: 'email_existed' },
            regex: { message: 'email_regex_invalid', value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i }
        }
    }
    export const FlattenSchema = flattenSchemaValue(Schema, BaseMessageErrorPrefix) // console.log(FlattenSchema)
}

export const zEmailRequiredValidator = z
    .string()
    .email(ValidatorConfig.Schema.email.email?.message)
    .min(ValidatorConfig.Schema.email.min?.value!, ValidatorConfig.Schema.email.min?.message)
    .max(ValidatorConfig.Schema.email.max?.value!, ValidatorConfig.Schema.email.max?.message)

export const zPasswordValidator = zRequiredValidator(ValidatorConfig.Schema.password.required?.message)
    .min(ValidatorConfig.Schema.password.min?.value!, ValidatorConfig.Schema.password.min?.message)
    .max(ValidatorConfig.Schema.password.max?.value!, ValidatorConfig.Schema.password.max?.message)
    .regex(new RegExp(ValidatorConfig.Schema.password.regex?.value!), ValidatorConfig.Schema.password.regex?.message)

export const zUsernameValidator = zRequiredValidator(ValidatorConfig.Schema.username.required?.message)
    .min(ValidatorConfig.Schema.username.min?.value!, ValidatorConfig.Schema.username.min?.message)
    .max(ValidatorConfig.Schema.username.max?.value!, ValidatorConfig.Schema.username.max?.message)
    .regex(new RegExp(ValidatorConfig.Schema.username.regex?.value!), ValidatorConfig.Schema.username.regex?.message)
```
