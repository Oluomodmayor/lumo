import { Address } from "../address/Address";
import { ExternalAddress } from "../address/ExternalAddress";
import { BitString } from "./BitString";

/**
 * Class for reading bit strings
 */
export class BitReader {

    private _bits: BitString;
    private _offset;
    private _checkpoints: number[] = [];

    constructor(bits: BitString, offset: number = 0) {
        this._bits = bits;
        this._offset = offset;
    }

    /**
     * Number of bits remaining
     */
    get remaining() {
        return this._bits.length - this._offset;
    }

    /**
     * Skip bits
     * @param bits number of bits to skip
     */
    skip(bits: number) {
        if (bits < 0 || this._offset + bits > this._bits.length) {
            throw new Error(`Index ${this._offset + bits} is out of bounds`);
        }
        this._offset += bits;
    }

    /**
     * Reset to the beginning or latest checkpoint
     */
    reset() {
        if (this._checkpoints.length > 0) {
            this._offset = this._checkpoints.pop()!;
        } else {
            this._offset = 0;
        }
    }

    /**
     * Save checkpoint
     */
    save() {
        this._checkpoints.push(this._offset);
    }

    /**
     * Load a single bit
     * @returns true if the bit is set, false otherwise
     */
    loadBit(): boolean {
        let r = this._bits.at(this._offset);
        this._offset++;
        return r;
    }

    /**
     * Preload bit
     * @returns true if the bit is set, false otherwise
     */
    preloadBit() {
        return this._bits.at(this._offset);
    }

    /**
     * Load bit string
     * @param bits number of bits to read
     * @returns new bitstring
     */
    loadBits(bits: number) {
        let r = this._bits.substring(this._offset, bits);
        this._offset += bits;
        return r;
    }

    /**
     * Preload bit string
     * @param bits number of bits to read
     * @returns new bitstring
     */
    preloadBits(bits: number) {
        return this._bits.substring(this._offset, bits);
    }

    /**
     * Load buffer
     * @param bytes number of bytes
     * @returns new buffer
     */
    loadBuffer(bytes: number) {
        let buf = this._preloadBuffer(bytes, this._offset);
        this._offset += bytes * 8;
        return buf;
    }

    /**
     * Preload buffer
     * @param bytes number of bytes
     * @returns new buffer
     */
    preloadBuffer(bytes: number) {
        return this._preloadBuffer(bytes, this._offset);
    }

    /**
     * Load uint value
     * @param bits uint bits
     * @returns read value as number
     */
    loadUint(bits: number): number {
        return Number(this.loadUintBig(bits));
    }

    /**
     * Load uint value as bigint
     * @param bits uint bits
     * @returns read value as bigint
     */
    loadUintBig(bits: number): bigint {
        let loaded = this.preloadUintBig(bits);
        this._offset += bits;
        return loaded;
    }

    /**
     * Preload uint value
     * @param bits uint bits
     * @returns read value as number
     */
    preloadUint(bits: number): number {
        return Number(this._preloadUint(bits, this._offset));
    }

    /**
     * Preload uint value as bigint
     * @param bits uint bits
     * @returns read value as bigint
     */
    preloadUintBig(bits: number): bigint {
        return this._preloadUint(bits, this._offset);
    }

    /**
     * Load int value
     * @param bits int bits
     * @returns read value as bigint
     */
    loadInt(bits: number): number {
        let res = this._preloadInt(bits, this._offset);
        this._offset += bits;
        return Number(res);
    }

    /**
     * Load int value as bigint
     * @param bits int bits
     * @returns read value as bigint
     */
    loadIntBig(bits: number): bigint {
        let res = this._preloadInt(bits, this._offset);
        this._offset += bits;
        return res;
    }

    /**
     * Preload int value
     * @param bits int bits
     * @returns read value as bigint
     */
    preloadInt(bits: number): number {
        return Number(this._preloadInt(bits, this._offset));
    }

    /**
     * Preload int value
     * @param bits int bits
     * @returns read value as bigint
     */
    preloadIntBig(bits: number): bigint {
        return this._preloadInt(bits, this._offset);
    }

    /**
     * Load varuint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    loadVarUint(bits: number): number {
        let size = Number(this.loadUint(bits));
        return Number(this.loadUintBig(size * 8));
    }

    /**
     * Load varuint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    loadVarUintBig(bits: number): bigint {
        let size = Number(this.loadUint(bits));
        return this.loadUintBig(size * 8);
    }

    /**
     * Preload varuint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    preloadVarUint(bits: number): number {
        let size = Number(this._preloadUint(bits, this._offset));
        return Number(this._preloadUint(size * 8, this._offset + bits));
    }

    /**
     * Preload varuint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    preloadVarUintBig(bits: number): bigint {
        let size = Number(this._preloadUint(bits, this._offset));
        return this._preloadUint(size * 8, this._offset + bits);
    }

    /**
     * Load varint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    loadVarInt(bits: number): number {
        let size = Number(this.loadUint(bits));
        return Number(this.loadIntBig(size * 8));
    }

    /**
     * Load varint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    loadVarIntBig(bits: number): bigint {
        let size = Number(this.loadUint(bits));
        return this.loadIntBig(size * 8);
    }

    /**
     * Preload varint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    preloadVarInt(bits: number): number {
        let size = Number(this._preloadUint(bits, this._offset));
        return Number(this._preloadInt(size * 8, this._offset + bits));
    }

    /**
     * Preload varint value
     * @param bits number of bits to read the size
     * @returns read value as bigint
     */
    preloadVarIntBig(bits: number): bigint {
        let size = Number(this._preloadUint(bits, this._offset));
        return this._preloadInt(size * 8, this._offset + bits);
    }

    /**
     * Load coins value
     * @returns read value as bigint
     */
    loadCoins() {
        return this.loadVarUintBig(4);
    }

    /**
     * Preload coins value
     * @returns read value as bigint
     */
    preloadCoins() {
        return this.preloadVarUintBig(4);
    }

    /**
     * Load Address
     * @returns Address
     */
    loadAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 2) {
            return this._loadInternalAddress();
        } else {
            throw new Error("Invalid address");
        }
    }

    /**
     * Load internal address
     * @returns Address or null
     */
    loadMaybeAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 0) {
            this._offset += 2;
            return null;
        } else if (type === 2) {
            return this._loadInternalAddress();
        } else {
            throw new Error("Invalid address");
        }
    }

    /**
     * Load external address
     * @returns ExternalAddress
     */
    loadExternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 1) {
            return this._loadExternalAddress();
        } else {
            throw new Error("Invalid address");
        }
    }

    /**
     * Load external address
     * @returns ExternalAddress or null
     */
    loadMaybeExternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 0) {
            this._offset += 2;
            return null;
        } else if (type === 1) {
            return this._loadExternalAddress();
        } else {
            throw new Error("Invalid address");
        }
    }

    /**
     * Read address of any type
     * @returns Address or ExternalAddress or null
     */
    loadAddressAny() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 0) {
            this._offset += 2;
            return null;
        } else if (type === 2) {
            return this._loadInternalAddress();
        } else if (type === 1) {
            return this._loadExternalAddress();
        } else if (type === 3) {
            throw Error('Unsupported');
        } else {
            throw Error('Unreachable');
        }
    }

    /**
     * Load bit string that was padded to make it byte alligned. Used in BOC serialization
     * @param bytes number of bytes to read
     */
    loadPaddedBits(bits: number) {

        // Check that number of bits is byte alligned
        if (bits % 8 !== 0) {
            throw new Error("Invalid number of bits");
        }

        // Skip padding
        let length = bits;
        while (true) {
            if (this._bits.at(this._offset + length - 1)) {
                length--;
                break;
            } else {
                length--;
            }
        }

        // Read substring
        let r = this._bits.substring(this._offset, length);
        this._offset += bits;
        return r;
    }

    /**
     * Clone BitReader
     */
    clone() {
        return new BitReader(this._bits, this._offset);
    }

    /**
     * Preload int from specific offset
     * @param bits bits to preload
     * @param offset offset to start from
     * @returns read value as bigint
     */
    private _preloadInt(bits: number, offset: number): bigint {
        if (bits == 0) {
            return 0n;
        }
        let sign = this._bits.at(offset);
        let res = 0n;
        for (let i = 0; i < bits - 1; i++) {
            if (this._bits.at(offset + 1 + i)) {
                res += 1n << BigInt(bits - i - 1 - 1);
            }
        }
        if (sign) {
            res = res - (1n << BigInt(bits - 1));
        }
        return res;
    }

    /**
     * Preload uint from specific offset
     * @param bits bits to preload
     * @param offset offset to start from
     * @returns read value as bigint
     */
    private _preloadUint(bits: number, offset: number): bigint {
        if (bits == 0) {
            return 0n;
        }
        let res = 0n;
        for (let i = 0; i < bits; i++) {
            if (this._bits.at(offset + i)) {
                res += 1n << BigInt(bits - i - 1);
            }
        }
        return res;
    }

    private _preloadBuffer(bytes: number, offset: number): Buffer {

        // Try to load fast
        let fastBuffer = this._bits.subbuffer(offset, bytes * 8);
        if (fastBuffer) {
            return fastBuffer;
        }

        // Load slow
        let buf = Buffer.alloc(bytes);
        for (let i = 0; i < bytes; i++) {
            buf[i] = Number(this._preloadUint(8, offset + i * 8));
        }
        return buf;
    }

    private _loadInternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type !== 2) {
            throw Error('Invalid address');
        }

        // No Anycast supported
        if (this._preloadUint(1, this._offset + 2) !== 0n) {
            throw Error('Invalid address');
        }

        // Read address
        let wc = Number(this._preloadInt(8, this._offset + 3));
        let hash = this._preloadBuffer(32, this._offset + 11);

        // Update offset
        this._offset += 267;

        return new Address(wc, hash);
    }

    private _loadExternalAddress() {

        let type = Number(this._preloadUint(2, this._offset));
        if (type !== 1) {
            throw Error('Invalid address');
        }

        // Load length
        let l = this._preloadUint(9, this._offset + 2);

        // Load address
        let value = this._preloadUint(Number(l), this._offset + 9);

        // Update offset
        this._offset += 9 + Number(l);

        return new ExternalAddress(value);
    }
}