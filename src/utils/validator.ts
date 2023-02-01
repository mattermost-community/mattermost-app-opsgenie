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

export const AppFormValidator = z.object({
    title: z.string(),
    header: z.string().optional(),
    icon: z.string(),
    fields: z.array(z.any()).optional(),
    submit: z.object({
        path: z.string(),
        expand: z.any().optional(),
        state: z.any().optional(),
    }),
});