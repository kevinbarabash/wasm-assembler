const ast = {
    kind: 'module',
    name: null,
    fields: [
        {
            kind: 'func',
            name: '$add',
            signature: {
                params: [
                    {
                        kind: 'type',
                        type: 'i32',
                        name: '$lhs',
                    },
                    {
                        kind: 'type',
                        type: 'i32',
                        name: '$rhs',
                    }
                ],
                result: [
                    {
                        kind: 'type',
                        type: 'i32',
                    },
                ],
            },
            locals: [],
            instructions: [
                {
                    kind: 'instruction',
                    name: 'get_local',
                    args: [
                        {
                            kind: 'identifier',
                            name: '$lhs',
                        }
                    ]
                },
                {
                    kind: 'instruction',
                    name: 'get_local',
                    args: [
                        {
                            kind: 'identifier',
                            name: '$rhs',
                        }
                    ]
                },
                {
                    kind: 'instruction',
                    name: 'i32.add',
                }
            ],
        },
        {
            kind: 'export',
            name: 'add',
            descriptor: {
                kind: 'func',
                name: '$add',
            }
        }
    ]
}
