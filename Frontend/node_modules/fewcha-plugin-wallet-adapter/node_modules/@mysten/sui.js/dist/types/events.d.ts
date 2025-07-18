import { SuiAddress, ObjectOwner, TransactionDigest } from './common';
import { ObjectId, SequenceNumber } from './objects';
import { SuiJsonValue } from './transactions';
export declare type MoveEvent = {
    packageId: ObjectId;
    transactionModule: string;
    sender: SuiAddress;
    type: string;
    fields?: {
        [key: string]: any;
    };
    bcs: string;
};
export declare type PublishEvent = {
    sender: SuiAddress;
    packageId: ObjectId;
};
export declare type TransferObjectEvent = {
    packageId: ObjectId;
    transactionModule: string;
    sender: SuiAddress;
    recipient: ObjectOwner;
    objectId: ObjectId;
    version: SequenceNumber;
    type: string;
    amount: number | null;
};
export declare type DeleteObjectEvent = {
    packageId: ObjectId;
    transactionModule: string;
    sender: SuiAddress;
    objectId: ObjectId;
};
export declare type NewObjectEvent = {
    packageId: ObjectId;
    transactionModule: string;
    sender: SuiAddress;
    recipient: ObjectOwner;
    objectId: ObjectId;
};
export declare type SuiEvent = {
    moveEvent: MoveEvent;
} | {
    publish: PublishEvent;
} | {
    transferObject: TransferObjectEvent;
} | {
    deleteObject: DeleteObjectEvent;
} | {
    newObject: NewObjectEvent;
} | {
    epochChange: bigint;
} | {
    checkpoint: bigint;
};
export declare type MoveEventField = {
    path: string;
    value: SuiJsonValue;
};
export declare type EventType = 'MoveEvent' | 'Publish' | 'TransferObject' | 'DeleteObject' | 'NewObject' | 'EpochChange' | 'Checkpoint';
export declare type SuiEventFilter = {
    Package: ObjectId;
} | {
    Module: string;
} | {
    MoveEventType: string;
} | {
    MoveEventField: MoveEventField;
} | {
    SenderAddress: SuiAddress;
} | {
    EventType: EventType;
} | {
    All: SuiEventFilter[];
} | {
    Any: SuiEventFilter[];
} | {
    And: [SuiEventFilter, SuiEventFilter];
} | {
    Or: [SuiEventFilter, SuiEventFilter];
};
export declare type SuiEventEnvelope = {
    timestamp: number;
    txDigest: TransactionDigest;
    event: SuiEvent;
};
export declare type SuiEvents = SuiEventEnvelope[];
export declare type SubscriptionId = number;
export declare type SubscriptionEvent = {
    subscription: SubscriptionId;
    result: SuiEventEnvelope;
};
export declare const EVENT_QUERY_MAX_LIMIT = 100;
export declare const DEFAULT_START_TIME = 0;
export declare const DEFAULT_END_TIME: number;
