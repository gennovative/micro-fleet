/**
 * A wrapper array that contains paged items.
 */
export class PagedArray<T> extends Array<T> {

	private _total: number = 0;

	/**
	 * Gets total number of items.
	 */
	public get total(): number {
		return this._total;
	}

	constructor(total: number = 0, ...items: T[]) {
		super();
		/* istanbul ignore else */
		if (Array.isArray(items)) {
			Array.prototype.push.apply(this, items);
		}

		Object.defineProperty(this, '_total', {
			enumerable: false,
			configurable: false,
			value: total
		});
	}

	/**
	 * Returns a serializable object.
	 */
	public asObject(): { total: number, data: any[] } {
		return {
			total: this._total,
			data: this.slice(0)
		};
	}
}
