import { z } from 'zod';

export const bodyPostUpdateValidator = z.object({
    message: z.string(),
    id: z.string(),
    props: z.object({
        app_bindings: z.tuple([
            z.object({
                app_id: z.string(),
                location: z.string(),
                description: z.string(),
                bindings: z.tuple([
                    z.object({
                        location: z.string(),
                        label: z.string(),
                        submit: z.object({
                            path: z.string(),
                            expand: z.object({
                                ExtendRequired: z.object({
                                    acting_user: z.string(),
                                    acting_user_access_token: z.string(),
                                    oauth2_app: z.string(),
                                    locale: z.string(),
                                }).optional(),
                                app: z.string(),
                                post: z.string(),
                            }),
                            state: z.string().optional(),
                        }),
                    }),
                    z.object({
                        location: z.string(),
                        label: z.string(),
                        submit: z.object({
                            path: z.string(),
                            expand: z.object({
                                ExtendRequired: z.object({
                                    acting_user: z.string(),
                                    acting_user_access_token: z.string(),
                                    oauth2_app: z.string(),
                                    locale: z.string(),
                                }).optional(),
                                app: z.string(),
                                post: z.string(),
                            }),
                            state: z.string().optional(),
                        }),
                    }),
                    z.object({
                        location: z.string(),
                        label: z.string(),
                        bindings: z.tuple([
                            z.object({
                                location: z.string(),
                                label: z.string(),
                                submit: z.object({
                                    path: z.string(),
                                    expand: z.object({
                                        ExtendRequired: z.object({
                                            acting_user: z.string(),
                                            acting_user_access_token: z.string(),
                                            oauth2_app: z.string(),
                                            locale: z.string(),
                                        }).optional(),
                                        app: z.string(),
                                        post: z.string(),
                                    }),
                                    state: z.any().optional(),
                                }),
                            }),
                            z.object({
                                location: z.string(),
                                label: z.string(),
                                submit: z.object({
                                    path: z.string(),
                                    expand: z.object({
                                        ExtendRequired: z.object({
                                            acting_user: z.string(),
                                            acting_user_access_token: z.string(),
                                            oauth2_app: z.string(),
                                            locale: z.string(),
                                        }).optional(),
                                        app: z.string(),
                                        post: z.string(),
                                    }),
                                    state: z.any().optional(),
                                }),
                            }),
                            z.object({
                                location: z.string(),
                                label: z.string(),
                                submit: z.object({
                                    path: z.string(),
                                    expand: z.object({
                                        ExtendRequired: z.object({
                                            acting_user: z.string(),
                                            acting_user_access_token: z.string(),
                                            oauth2_app: z.string(),
                                            locale: z.string(),
                                        }).optional(),
                                        app: z.string(),
                                        post: z.string(),
                                    }),
                                    state: z.any().optional(),
                                }),
                            }),
                            z.object({
                                location: z.string(),
                                label: z.string(),
                                submit: z.object({
                                    path: z.string(),
                                    expand: z.object({
                                        ExtendRequired: z.object({
                                            acting_user: z.string(),
                                            acting_user_access_token: z.string(),
                                            oauth2_app: z.string(),
                                            locale: z.string(),
                                        }).optional(),
                                        app: z.string(),
                                        post: z.string(),
                                    }),
                                    state: z.any().optional(),
                                }),
                            }),
                        ]),
                    }),
                ]),
            }),
        ]),
    }),
});

export const AppFormFieldValidator = z.object({
    name: z.string(),
    type: z.string(),
    is_required: z.boolean().optional(),
    readonly: z.boolean().optional(),
    value: z.any().optional(),
    description: z.string().optional(),
    label: z.string().optional(),
    hint: z.string().optional(),
    position: z.number().int().optional(),
    modal_label: z.string().optional(),
    refresh: z.boolean().optional(),
    options: z.tuple([
        z.object({
            label: z.string(),
            value: z.string(),
            icon_data: z.string().optional(),
        }),
    ]).optional(),
    multiselect: z.boolean().optional(),
    subtype: z.string().optional(),
    min_length: z.number().int().optional(),
    max_length: z.number().int().optional(),
});

export const AppFormValidator = z.object({
    title: z.string(),
    header: z.string().optional(),
    icon: z.string(),
    fields: z.array(AppFormFieldValidator).optional(),
    submit: z.object({
        path: z.string(),
        expand: z.any().optional(),
        state: z.any().optional(),
    }),
});