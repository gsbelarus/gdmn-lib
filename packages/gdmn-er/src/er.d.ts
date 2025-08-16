export type EntityRecord<T = undefined> = T extends object ? T : Record<string, any>;
export type EntityRecordSet<T = EntityRecord> = T[];
export type EntityEvent<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<void>;
export type EntityEvent2<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<EntityRecord<T>>;
export type EntityMethodFn<E, T extends EntityRecord<any>> = (e: E, args?: Record<string, any>) => Promise<EntityRecord<T> | boolean>;
export type MethodParam = {
    name: string;
    type: string;
    required?: boolean;
    nullable?: boolean;
    default?: any;
};
export type MethodEnvironment = 'server' | 'client' | 'both';
export type MethodCode = {
    /**
     * Language of the code, e.g. 'javascript', 'typescript', etc.
     */
    lang: string;
    /**
     * The actual code as a string.
     */
    code: string;
    /**
     * Prompt for the code generation.
     */
    prompt?: string;
    /**
     * Indicates if the code is derived from the prompt.
     * Will be switched to false if the code is modified by the user.
     */
    derived?: boolean;
};
export type Method<E = Entity, T = EntityRecord<any>> = {
    name: string;
    namespace: string;
    environment: MethodEnvironment;
    description?: string;
    params?: MethodParam[];
    returnType?: string;
    returnDescription?: string;
    code?: MethodCode;
    fn?: EntityMethodFn<E, T>;
    order: number;
    disabled?: boolean;
};
export declare const simpleAttrTypes: readonly ["array", "objectid", "boolean", "number", "string", "timestamp", "date", "time", "entity", "enum", "map", "buffer"];
export type SimpleAttrType = (typeof simpleAttrTypes)[number];
export declare function str2simpleAttrType(str: string): SimpleAttrType | undefined;
export declare const ofTypes: readonly ["string", "number", "boolean", "timestamp", "objectid", "entity", "object"];
export type OfType = (typeof ofTypes)[number] | EntityAttributes;
export declare function str2OfTypes(str: string): OfType | undefined;
export type RefFieldProps = {
    /**
     * The full name of the entity being referenced.
     */
    referencesEntity: string;
    /**
     * The name of the reference field in the current Entity.
     */
    referenceFieldName: string;
    /**
     * The name of the field to display from the referenced Entity.
     * The field should contain a string identifying the referenced object.
     */
    referencedObjectDisplayFieldName: string;
};
export type DisplayedField = {
    field: string;
    readonly?: boolean;
    visible?: boolean;
};
export type AttrTypeDef = {
    type: AttrType;
    required?: boolean;
    nullable?: boolean;
    default?: any;
    enum?: any[] | readonly any[];
    min?: number;
    max?: number;
    minlength?: number;
    maxlength?: number;
    trim?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
    match?: string;
    validator?: string | RegExp;
    index?: boolean;
    unique?: boolean;
    sparse?: boolean;
    /**
     * For reference fields, the full name of the entity being referenced.
     */
    referencesEntity?: string;
    label?: string;
    description?: string;
    placeholder?: string;
    tooltip?: string;
    of?: OfType;
    /**
     * An object to group values into smaller group. Similar on values merging.
     * */
    highLevelGroupingObject?: Record<any, any>;
    filterable?: boolean;
    readonly?: boolean;
    displayedFields?: DisplayedField[];
    referenceFieldProps?: RefFieldProps;
    nestedAttributes?: EntityAttributes[];
    system?: boolean;
    visible?: boolean;
    namespace?: string;
};
export type Options = {
    _id?: boolean;
    collection?: string;
};
export type EntitySchema = {
    entity: Entity;
    options?: Options;
};
export type AttrType = SimpleAttrType | AttrTypeDef | EntityAttributes | EntitySchema | Array<AttrType>;
export type EntityAttributes = {
    [attrName: string]: AttrType;
};
export declare const METHOD_TYPES_SERVER: readonly ["beforePost", "afterPost", "beforeUpdate", "afterUpdate", "beforeDelete", "afterDelete"];
export declare const METHOD_TYPES_CLIENT: readonly ["beforeSubmit", "afterSubmit", "beforeFormOpen", "afterFormOpen"];
export declare const METHOD_TYPES: readonly ["beforePost", "afterPost", "beforeUpdate", "afterUpdate", "beforeDelete", "afterDelete", "beforeSubmit", "afterSubmit", "beforeFormOpen", "afterFormOpen"];
export type MethodType = typeof METHOD_TYPES[number];
export type EntityDefMethods = Map<MethodType, Method[]>;
export type EntityMethods = Partial<Record<MethodType, Method[]>>;
export interface Entity {
    /**
     *  Full entity name we inherit from
     */
    parent?: string;
    /**
     *  Namespace the entity belongs to
     */
    namespace?: string;
    /**
     *  Name of the entity
     *  Must be unique within the namespace
     */
    name: string;
    /**
     * Label for use in the user interface
     * If not specified, the name attribute will be used as the label
     * */
    label?: string;
    /**
     * Detailed description of the entity.
     */
    description?: string;
    /**
     * Object title template
     * Example: 'name' -- use 'name' attribute as object title
     * Example: ['$specialization', ' [', $language, ']'] -- this will generate
     * object title from 'specialization' and 'language' attributes. The array
     * provided will be used in the $concat aggregation operator.
     * If not specified, object title will be generated from the _id attribute
     * */
    objectTitle?: string | string[];
    attributes: EntityAttributes;
    options?: Record<string, boolean>;
    methods?: EntityMethods;
    abc?: boolean;
    /**
     * Custom page for viewing the entity's records
     * */
    viewForm?: string;
    /**
     * Custom page for creating/editing/viewing single record of the entity
     * */
    dlgForm?: string;
}
export declare function isEntitySchema(attrType: AttrType): attrType is EntitySchema;
export declare function isAttrTypeDef(attrType: AttrType): attrType is AttrTypeDef;
export declare function isEntityAttributes(attrType: AttrType): attrType is EntityAttributes;
export declare function isEntity(obj: any): obj is Entity;
/**
 * Retrieves the name of the entity.
 * @param entity
 * @returns The full name of the entity, including namespace if applicable.
 */
export declare function getEntityName(entity: Entity): string;
export declare function compareEntityNames(a: Entity | string | undefined, b: Entity | string | undefined): boolean;
export declare function isSimpleAttrType(attrType: AttrType): attrType is SimpleAttrType;
export declare function isStringAttr(attrType: AttrType): boolean;
export declare function isNumberAttr(attrType: AttrType): boolean;
export declare function isBooleanAttr(attrType: AttrType): boolean;
export declare function isTimestampAttr(attrType: AttrType): boolean;
export declare function isDateAttr(attrType: AttrType): boolean;
export declare function isTimeAttr(attrType: AttrType): boolean;
export type AttrTypeToGet = {
    type: SimpleAttrType;
    isArray: boolean;
};
export declare function getAttrType(attrType: AttrType): AttrTypeToGet;
