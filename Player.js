/* TODO
 * constant rebalancing of stats per class
 * remove pissmance, as it was just a joke for one of the people helping me test and won't make it to the final game
 * 
 */
class player {
    //attributes
    name;
    charClass;
    level;
    xp;
    remainingXP;
    coin;
    maxHP;
    hp;
    attack;
    attackSpeed;
    kills;
    isDead;
    id;
    availableFights = 0;
    availablePlayerFights = 0;
    inFight = false;
    

    //constructor - arguments are id, name, class, level, xp, coin, maxHP, attack, attackSpeed, and kills
    constructor() {
        switch (arguments.length) {
            case 3:
                this.id = arguments[0]
                this.name = arguments[1];
                this.charClass = arguments[2];
                this.level = 1;
                this.xp = 0;
                this.coin = 500;
                this.kills = 0;
                switch (this.charClass) {
                    case "archer":
                        this.maxHP = 80;
                        this.attack = 12;
                        this.attackSpeed = 1.2;
                        break;
                    case "fighter":
                        this.maxHP = 100;
                        this.attack = 10;
                        this.attackSpeed = 1;
                        break;
                    case "rogue":
                        this.maxHP = 70;
                        this.attack = 13;
                        this.attackSpeed = 1.3;
                    case "pissmancer":
                        this.maxHP = 70;
                        this.attack = 8;
                        this.attackSpeed = .3;
                }
                this.xpLeft();
                this.isDead == false;
                this.availableFights = 10;
                this.availablePlayerFights = 3;
                break;
            case 10:
                this.id = arguments[0];
                this.name = arguments[1];
                this.charClass = arguments[2];
                this.level = arguments[3];
                this.xp = arguments[4];
                this.coin = arguments[5];
                this.maxHP = arguments[6];
                this.attack = arguments[7];
                this.attackSpeed = arguments[8];
                this.kills = arguments[9];
                this.xpLeft();
                this.calculateLevelFromXP();
                this.isDead = false;
                this.availableFights = 5;
                this.availablePlayerFights = 3;
                break;
            default:
                return false;
                break;
        }
        this.hp = this.maxHP;
        this.isDead = false;
        this.calculateLevelFromXP();
    }

    //methods
    addXP(xp) {
        if (!Number.isNaN(xp)) {
            this.xp += Math.round(xp);
            this.calculateLevelFromXP();
            this.xpLeft();
        }
        
    }

    removeXP(xp) {
        if (!Number.isNaN(xp)) {
            this.xp -= xp;

            if (this.level <= 0) {
                this.level = 1;
            }
            if (this.xp <= 0) {
                this.xp = 0;
            }
            this.calculateLevelFromXP();
            this.xpLeft();
        }
    }

    healWithCoin(coin) {
        
        if (!Number.isNaN(coin)) {
            if (coin <= this.coin) {
                this.coin -= coin;
                
                this.hp += coin * .8;
                if (this.hp >= this.maxHP) {
                    this.hp = this.maxHP;
                }
                if (this.hp > 0) {
                    this.isDead = false;
                }
            }
            
        }
    }

    heal(hp) {
        if (!Number.isNaN(hp)) {
            this.hp += hp;
            if (this.hp >= this.maxHP) {
                this.hp = this.maxHP;
            }
            if (this.hp > 0) {
                this.isDead = false;
            }
        }
    }

    takeDamage(damage) {
        
        if (!Number.isNaN(damage)) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.hp = 0;
                this.isDead = true;
            }
        }

    }

    calculateLevelFromXP() {
        var newLevel = Math.trunc(0.07 * Math.sqrt(this.xp));
        var loop = 1;
        var curLevel;
        if (newLevel <= 0) {
            newLevel = 1;
            this.level = 1;
        }
        curLevel = this.level;

        while (newLevel > curLevel) {
            switch (this.charClass) {
                case "archer":
                    this.maxHP += 8;
                    this.attack += 1.1;
                    this.attackSpeed += .12;
                    break;
                case "fighter":
                    this.maxHP += 10;
                    this.attack += .9;
                    this.attackSpeed += .1;
                    break;
                case "rogue":
                    this.maxHP += 7;
                    this.attack += 1.2;
                    this.attackSpeed += .13;
                    break;
                case "pissmancer":
                    this.maxHP += 6;
                    this.attack += 2.5;
                    this.attackSpeed += .8;
                    break;
            }
            curLevel++;
            console.log(`Finished loop ${loop}`);
            loop++;
        }
        this.level = curLevel;
    }

    calculateDamage() {
        var damage = 0;
        for (let i = 0; i <= this.attack; i++) {
            damage += Math.ceil(Math.random() * 8);

        }
               
        return damage;
    }

    xpLeft() {
        this.remainingXP = Math.trunc(((this.level + 1) / 0.07) * ((this.level + 1) / 0.07)) - this.xp;
    }

    addCoin(coin) {
        if (!Number.isNaN(coin)) {
            this.coin += Math.trunc(coin);
        }
    }

    removeCoin(coin) {
        if (!Number.isNaN(coin)) {
            this.coin -= Math.trunc(coin);
        }
    }

    xpForCoins(xp) {
        if (!Number.isNaN(xp)) {
            if (xp <= this.xp) {
                this.coin += (xp / 10);
                this.removeXP(xp);
            }
        }
    }

    coinsForXP(coins) {
        if (!Number.isNaN(coins)) {
            if (coins <= this.coin) {
                this.coin -= coins;
                this.addXP(coins * this.level);
            }
        }
    }

    //getters and setters
    setName(name) {
        if (!name.length >= 0) {
            this.name = name;
        }
    }
}
module.exports = player;
    
