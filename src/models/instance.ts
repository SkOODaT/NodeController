"use strict";

import { Database } from '../data/mysql';
import { logger } from '../utils/logger';
import config      = require('../config.json');
const db           = new Database(config);

/**
 * Instance type enumeration.
 */
enum InstanceType {
    CirclePokemon = 'circle_pokemon',
    CircleRaid = 'circle_raid',
    SmartCircleRaid = 'circle_smart_raid',
    AutoQuest = 'auto_quest',
    PokemonIV = 'pokemon_iv',
    GatherToken = 'gather_token',
    Leveling = 'leveling'
}

/**
 * Instance data interface.
 */
interface IInstanceData {
    //[json("timezone_offset")]
    timezone_offset: number;
    spin_limit: number;
    iv_queue_limit: number;
    area: any;
    min_level: number;
    max_level: number
}

/**
 * Base instance interface.
 */
interface IInstance {
    name: string;
    type: InstanceType;
    data: IInstanceData;
}

/**
 * Instance model class.
 */
class Instance implements IInstance {
    name: string;
    type: InstanceType;
    data: IInstanceData;

    /**
     * Initialize new Instance object.
     * @param name Name of the instance.
     * @param type Type of instance.
     * @param data Instance data containing area coordinates, minimum and maximum account level, etc.
     */
    constructor(name: string, type: InstanceType, data: IInstanceData) {
        this.name = name;
        this.type = type;
        this.data = data;
    }
    static fromString(value: string): InstanceType {
        let val = value.toLowerCase();
        if (val === "circle_pokemon" || val === "circlepokemon") {
            return InstanceType.CirclePokemon;
        } else if (val == "circle_raid" || val === "circleraid") {
            return InstanceType.CircleRaid;
        } else if (val === "circle_smart_raid" || val === "circlesmartraid") {
            return InstanceType.SmartCircleRaid;
        } else if (val === "auto_quest" || val === "autoquest") {
            return InstanceType.AutoQuest;
        } else if (val === "pokemon_iv" || val === "pokemoniv") {
            return InstanceType.PokemonIV;
        } else if (val === "leveler" || val === "leveling") {
            return InstanceType.Leveling;
        } else if (val === "gather_token" || val === "gathertoken") {
            return InstanceType.GatherToken;
        } else {
            return null;
        }
    }
    async create() {
        let sql = `
            INSERT INTO instance (name, type, data)
            VALUES (?, ?, ?)
        `;
        let args = [
            this.name,
            this.type,
            JSON.stringify(this.data)
        ];
        let results = await db.query(sql, args)
            .then(x => x)
            .catch(err => {
                logger.error("[Instance] Failed to execute query. (" + err + ")");
            });
    }
    /**
     * Get all Instances.
     */
    static getAll(): Promise<Instance[]> {
        return this.load();
    }
    /**
     * Get instance by name.
     * @param instanceName Name of the instance.
     */
    static async getByName(instanceName: string): Promise<Instance> {
        let sql = `
        SELECT name, type, data
        FROM instance
        WHERE name = ?
        LIMIT 1
        `;
        let result = await db.query(sql, instanceName)
            .then(x => x)
            .catch(err => { 
                logger.error("[ACCOUNT] Failed to get Instance with name " + instanceName);
                return null;
            });
        let instance: Instance;
        let keys = Object.values(result);
        keys.forEach(function(key) {
            instance = new Instance(
                key.name,
                key.type,
                key.data
            );
        })
        return instance;
    }
    /**
     * Delete instance by name.
     * @param instanceName Name of the instance.
     */
    static async delete(instanceName: string): Promise<void> {
        let sql = `
        DELETE FROM instance
        WHERE name = ?
        `;
        let result = await db.query(sql, instanceName)
            .then(x => x)
            .catch(err => { 
                logger.error("[Instance] Failed to delete instance with name " + name);
                return null;
            });
        logger.info("[Instance] Delete: " + result);
    }
    /**
     * Update instance data.
     * @param oldName Old name of the instance.
     */
    async update(oldName: string): Promise<void> {
        let sql = `
        UPDATE instance
        SET data = ?, name = ?, type = ?
        WHERE name = ?
        `;
        let dataJson = JSON.stringify(this.data);
        let args = [dataJson, this.name, this.type, oldName];
        let result = await db.query(sql, args)
            .then(x => x)
            .catch(err => { 
                logger.error("[Instance] Failed to update instance with name " + name);
                return null;
            });
        logger.info("[Instance] Update: " + result);
    }
    /**
     * Load all instances.
     */
    static async load(): Promise<Instance[]> {
        // TODO: Load instances from cache and mysql, check diff, add new/changes to cache.
        //let data = redisClient.get(INSTANCE_LIST);
        /*
        client.get(INSTANCE_LIST, function(err: Error, result) {
            if (err) {
                logger.error("[Instance] load: " + err);
            }
            if (result) {
                let data = JSON.parse(result);
                let keys = Object.keys(data);
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    let instance = data[key];
                    InstanceController.instance.Instances[key] = new Instance(
                        instance.name,
                        instance.type,
                        instance.data
                    );
                }
                logger.info("[Instance] RESULT: " + data);
                //return data;
            }
        });
        */
        let sql = `
        SELECT name, type, data
        FROM instance
        `;
        let results = await db.query(sql)
            .then(x => x)
            .catch(err => {
                logger.error("[Instance] Error: " + err);
                return null;
            });
        let instances: Instance[] = [];
        if (results) {
            let keys = Object.values(results);
            keys.forEach(key => {
                let data = JSON.parse(key.data);
                let instance = new Instance(
                    key.name,
                    key.type,
                    data
                );
                instances.push(instance);
            });
        }
        return instances;
    }
}

export { InstanceType, Instance, IInstanceData };