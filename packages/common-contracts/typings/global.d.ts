/// <reference types="automapper-ts" />

/**
 * Basically a string, but presents a 64-bit big integer value.
 */
type BigInt = string;

/**
 * A datatype that presents composite primary key.
 */
type TenantPk = {
	id: BigInt,
	tenantId: BigInt
};

/**
 * A datatype that presents non-primary unique properties.
 */
type NameUk = {
	name: string
}


type PkType = BigInt | TenantPk;

/**
 * Represents a data transfer object, aka: business model.
 */
declare interface IModelDTO {
	id?: BigInt;
	tenantId?: BigInt;
}

/**
 * Represents a model that is tracked when it is created and last updated.
 */
declare interface IAuditable extends IModelDTO {
	/**
	 * The time when this model is created.
	 */
	createdAt?: Date;

	/**
	 * The time when this model is last updated.
	 */
	updatedAt?: Date;
}

/**
 * Represents a model that is never really removed from database.
 */
declare interface ISoftDeletable extends IModelDTO {
	/**
	 * If has value, this model is marked as deleted.
	 * Otherwise, it is still active.
	 */
	deletedAt?: Date;
}

/**
 * Represents a model that can be added more properties.
 */
declare interface IExtensible extends IModelDTO {
	/**
	 * Contains additional properties.
	 */
	attributes?: any; // Should map to JSON type in PostreSQL.
}


/**
 * Represents a model whose history is tracked.
 */
declare interface IVersionControlled extends IModelDTO {
	/**
	 * The time when this version is created.
	 */
	createdAt: Date;

	/**
	 * Whether this is official version.
	 */
	isMain: boolean;

	/**
	 * The version of records with same Id.
	 */
	version: number;
}


/**
 * If an object wants to be initialized when microservice proccess starts, it must
 * implements this interface to be able to add to add-on list.
 */
declare interface IServiceAddOn {
	/**
	 * Gets or sets add-on name.
	 */
	name?: string;

	/**
	 * Initializes this add-on.
	 * @returns A promise that resolves `true` if success, rejects if otherwise.
	 */
	init(): Promise<void>;

	/**
	 * Invoked before `dispose` is called.
	 */
	deadLetter(): Promise<void>;

	/**
	 * Stops this add-on and cleans all resources.
	 */
	dispose(): Promise<void>;

}