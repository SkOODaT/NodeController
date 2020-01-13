"use strict"

import * as mysql from '../data/mysql';
import config      = require('../config.json');
const db           = new mysql.Database(config);

/**
 * Account model class.
 */
class Account {
    username: string;
    password: string;
    firstWarningTimestamp: number;
    failedTimestamp: number;
    failed: string;
    level: number;
    lastEncounterLat: number;
    lastEncounterLon: number;
    lastEncounterTime: number;
    spins: number;
    tutorial: number;
    ptcToken: string;

    /**
     * Initalize new Account object.
     * @param username 
     * @param password 
     * @param firstWarningTimestamp 
     * @param failedTimestamp 
     * @param failed 
     * @param level 
     * @param lastEncounterLat 
     * @param lastEncounterLon 
     * @param lastEncounterTime 
     * @param spins 
     * @param tutorial 
     * @param ptcToken 
     */
    constructor(username: string, password: string, firstWarningTimestamp: number, failedTimestamp: number,
        failed: string, level: number, lastEncounterLat: number, lastEncounterLon: number, lastEncounterTime: number,
        spins: number, tutorial: number, ptcToken: string) {
        this.username = username;
        this.password = password;
        this.firstWarningTimestamp = firstWarningTimestamp;
        this.failedTimestamp = failedTimestamp;
        this.failed = failed;
        this.level = level;
        this.lastEncounterLat = lastEncounterLat;
        this.lastEncounterLon = lastEncounterLon;
        this.lastEncounterTime = lastEncounterTime;
        this.spins = spins;
        this.tutorial = tutorial;
        this.ptcToken = ptcToken;
    }
    /**
     * Get all accounts.
     */
    static getAll() {
        return this.load();
    }
    /**
     * Get new account between minimum and maximum level.
     * @param minLevel 
     * @param maxLevel 
     */
    static async getNewAccount(minLevel: number, maxLevel: number) {
        let sql = `
        SELECT username, password, level, first_warning_timestamp, failed_timestamp, failed, last_encounter_lat, last_encounter_lon, last_encounter_time, spins
        FROM account
        LEFT JOIN device ON username = account_username
        WHERE first_warning_timestamp is NULL AND failed_timestamp is NULL and device.uuid IS NULL AND level >= ? AND level <= ? AND failed IS NULL AND (last_encounter_time IS NULL OR UNIX_TIMESTAMP() -  CAST(last_encounter_time AS SIGNED INTEGER) >= 7200 AND spins < 400)
        ORDER BY level DESC, RAND()
        LIMIT 1
        `;
        let result = await db.query(sql, [minLevel, maxLevel])
            .then(x => x)
            .catch(x => { 
                console.log("[ACCOUNT] Failed to get new Account");
                return null;
            });
        let account: Account;
        let keys = Object.values(result);
        keys.forEach(function(key) {
            account = new Account(
                key.username,
                key.password,
                key.first_warning_timestamp,
                key.failed_timestamp,
                key.failed,
                key.level,
                key.last_encounter_lat,
                key.last_encounter_lon,
                key.last_encounter_time,
                key.spins,
                key.tutorial,
                null//key.ptc_token
            );
        })
        return account;
    }
    /**
     * Increment spin for account with username.
     * @param username 
     */
    static spin(username: string) {
        // TODO: Account.spin
    }
    /**
     * Get account with username.
     * @param username 
     */
    static async getWithUsername(username: string) {
        let sql = `
        SELECT username, password, first_warning_timestamp, failed_timestamp, failed, level, last_encounter_lat, last_encounter_lon, last_encounter_time, spins, tutorial, ptc_token
        FROM account
        WHERE username = ?
        LIMIT 1
        `;
        let result = await db.query(sql, username)
            .then(x => x)
            .catch(x => { 
                console.log("[ACCOUNT] Failed to get Account with username", username);
                return null;
            });
        let account: Account;
        let keys = Object.values(result);
        keys.forEach(function(key) {
            account = new Account(
                key.username,
                key.password,
                key.first_warning_timestamp,
                key.failed_timestamp,
                key.failed,
                key.level,
                key.last_encounter_lat,
                key.last_encounter_lon,
                key.last_encounter_time,
                key.spins,
                key.tutorial,
                null//key.ptc_token
            );
        })
        return account;
    }
    /**
     * Add encounter data to specified account.
     * @param username 
     * @param newLat 
     * @param newLon 
     * @param encounterTime 
     */
    static didEncounter(username: string, newLat: number, newLon: number, encounterTime: number) {
        // TODO: Account.didEncounter
    }
    /**
     * Clear spins for account.
     */
    static clearSpins() {
        // TODO: Account.clearSpins
    }
    /**
     * Set account level.
     * @param username 
     * @param level 
     */
    static setLevel(username: string, level: number) {
        // TODO: Account.setLevel
    }
    /**
     * Save account.
     * @param update 
     */
    async save(update: boolean) {

        if (update) {
            let sql = `
            UPDATE account
            SET password = ?, level = ?, first_warning_timestamp = ?, failed_timestamp = ?, failed = ?, last_encounter_lat = ?, last_encounter_lon = ?, last_encounter_time = ?, spins = ?
            WHERE username = ?
            `;
            let args = [this.password, this.level, this.firstWarningTimestamp, this.failedTimestamp, this.failed, this.lastEncounterLat, this.lastEncounterLon, this.lastEncounterTime, this.spins];
            let result = await db.query(sql, args)
                .then(x => x)
                .catch(x => {
                    console.log("[ACCOUNT] Error:", x);
                    return null;
                });
            console.log("[ACCOUNT] Update:", result)
        } else {
            let sql = `
            INSERT INTO account (username, password, level, first_warning_timestamp, failed_timestamp, failed, last_encounter_lat, last_encounter_lon, last_encounter_time, spins)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            let args = [this.username, this.password, this.level, this.firstWarningTimestamp, this.failedTimestamp, this.failed, this.lastEncounterLat, this.lastEncounterLon, this.lastEncounterTime, this.spins];
            let result = await db.query(sql, args)
                .then(x => x)
                .catch(x => {
                    console.log("[ACCOUNT] Error:", x);
                    return null;
                });
            console.log("[ACCOUNT] Insert:", result)
        }
    }
    /**
     * Load all accounts.
     */
    static async load() {
        let sql = `
        SELECT username, password, first_warning_timestamp, failed_timestamp, failed, level, last_encounter_lat, last_encounter_lon, last_encounter_time, spins, tutorial
        FROM account
        `; //TODO: ptc_token
        let results = await db.query(sql)
            .then(x => x)
            .catch(x => {
                console.log("[DEVICE] Error:", x);
                return null;
            });
        let accounts: Account[] = [];
        let keys = Object.values(results);
        keys.forEach(function(key) {
            let account = new Account(
                key.username,
                key.password,
                key.first_warning_timestamp,
                key.failed_timestamp,
                key.failed,
                key.level,
                key.last_encounter_lat,
                key.last_encounter_lon,
                key.last_encounter_time,
                key.spins,
                key.tutorial,
                null//key.ptc_token
            );
            accounts.push(account);
        });
        return accounts;
    }
}

// Export the class
export { Account };