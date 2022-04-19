import { initWithGame, World, Player, Profile, AI_STEP_TYPE } from './compat.js'


const compat = {
   World: null
};

export function startLegacyAi (game, endTurnCallback) {
   initWithGame(game, endTurnCallback);
   compat.World = new World(game);
   resetAllAIVars();
   AiSystemCreate();
   AiSystemExecute(new Player(game.currentPlayer));
}

function resetAllAIVars () {
   aiWishlist_counter = 0;
   aiWishlist_profiles = new Array(AiWishlist_Max);
   AIexecutionState = 0;
   AiSystemDone = false;
   AiSystemMoveWeakUnitsDone = false;
   AiSystemMoveOrFightDone = false;
   AiSystemStandardUnitsDone = false;
   UnitCounter = 0;
   gameMap_influence = [];
   gameMap_marker = [];
   gameMap_fortify = [];
   gameMap_threat = [];
   report = { human: 0, soft: 0, hard: 0, air: 0, water: 0 };
   score = 0;
   neighbour = 0;
   AiSystemExecuteINT = null;
   AiSystemExecute_MoveWeakUnitsINT = null;
   DisplayBattleINT = null;
   AiSystemExecute_StandardUnitsINT = null;
}



//---------------------
// modofied old AI code
//---------------------

const UnitDataObjects = new Array(13).fill(0).map((_, i) => new Profile(i + 1));

const AiWishlist_Max = 1000;
let aiWishlist_counter = 0;
let aiWishlist_profiles = new Array(AiWishlist_Max);

const AiInfluence_Aggressive = 0;
const AiInfluence_Passive = 1;

let gameInfluence_baseBehaviour = AiInfluence_Aggressive;

let AIexecutionState = 0;
let AiSystemDone = false;


let AiSystemMoveWeakUnitsDone = false;
let AiSystemMoveOrFightDone = false;
let AiSystemStandardUnitsDone = false;

let UnitCounter = 0;

const Ai_InvalidValue = -1000;
const GameMovement_BlockedField = -1;

let gameMap_influence = [];
let gameMap_marker = [];
let gameMap_fortify = [];
let gameMap_threat = [];

const DataUnit_ProfileId_Infantry = new Profile(2);

const Unit_State_WaitingForOrder = 0;
const Unit_State_FinishedMoving = 1; // Seems unused.
const Unit_State_Finished = 2;

let report = { human: 0, soft: 0, hard: 0, air: 0, water: 0 };

// Vars which were previously global but w/o declaration
let score = 0;
let neighbour = 0;

// intervals
let AiSystemExecuteINT = null;
let AiSystemExecute_MoveWeakUnitsINT = null;
let DisplayBattleINT = null;
let AiSystemExecute_StandardUnitsINT = null;


function AiWishlistCreate() {
   console.log("AiWishlistCreate()");
   AiWishlistReset();
}

function AiWishlistDestroy() {
   console.log("AiWishlistDestroy()");
}

function AiWishlistReset() {
   console.log("AiWishlistReset()");
   let i = 0;
   while (i < AiWishlist_Max)
   {
      aiWishlist_profiles[i] = -1;
      i++;
   }
   aiWishlist_counter = 0;
}

function AiWishlistAdd(profile) {
   if (aiWishlist_counter >= AiWishlist_Max) {
      console.log("list full!");
   } else {
      aiWishlist_profiles[aiWishlist_counter] = profile;
      aiWishlist_counter++;
   }
}

function AiWishlistGetRandomProfile() {
   if (aiWishlist_counter == 0) {
      console.log("no entries!");
   }
   return aiWishlist_profiles[Math.floor(Math.random() * aiWishlist_counter)];
}

function AiWishlistIsEmpty() {
   return aiWishlist_counter == 0;
}

function AiInfluenceSetBaseBehaviour(behaviour) {
   // likely an unnecessary parameter, the set base behaviour fn seems to be disabled
   gameInfluence_baseBehaviour = AiInfluence_Aggressive;
}

function AiInfluencePrepareMap_Fortify(player) {
   // TODO dtypes
   console.log("AiInfluencePrepareMap_Fortify()");
   AiInfluenceClearFortify();
   for (let i = 0; i < compat.World.unitList.length; i++) {
      let unit = compat.World.unitList[i];
      if (player.areEnemy(unit)) {
         if (compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(unit))) {
            compat.World.createMovement(unit, false);
            let _loc2_ = 0;
            while(_loc2_ < compat.World.rows) {
               let _loc1_ = 0;
               while (_loc1_ < compat.World.cols) {
                  if (compat.World.map.movement[_loc2_][_loc1_] > 0) {
                     gameMap_fortify[_loc2_][_loc1_] = 1;
                  }
                  _loc1_ = _loc1_ + 1;
               }
               _loc2_ = _loc2_ + 1;
            }
            compat.World.clearMovementMap();
         }
      }
   }
}

function AiInfluencePrepareMap_Supply(unit /* compat.Unit */) {
   AiInfluenceClearScore();
   AiInfluenceClearMarker();
   let _loc6_ = null;
   let _loc4_ = null; // compat.City
   const _loc7_ = compat.World.UnitsGetProfile(unit);
   let _loc8_ = false;
   let _loc3_ = 0;
   while (_loc3_ < compat.World.rows) {
      let _loc2_ = 0;
      while (_loc2_ < compat.World.cols) {
         score = 0;
         _loc4_ = compat.World.getCity(_loc3_, _loc2_);
         _loc6_ = compat.World.map.units[_loc3_][_loc2_];
         _loc8_ = false;
         if (_loc4_ != null) {
            if (_loc4_.getPlayer() == null && compat.World.DataUnitsCanCaptureCity(_loc7_)) {
               if (_loc6_.equals(unit)) {
                  gameMap_influence[_loc3_][_loc2_] = 1000;
                  gameMap_marker[_loc3_][_loc2_] = 2;
               }
               else if (_loc6_ == null) {
                  gameMap_influence[_loc3_][_loc2_] = 500;
                  gameMap_marker[_loc3_][_loc2_] = 2;
               }
            }
            else if (compat.World.CitiesCanSupplyUnit(_loc4_, unit)) {
               gameMap_influence[_loc3_][_loc2_] = 2000;
               gameMap_marker[_loc3_][_loc2_] = 2;
               neighbour = 0;
               while (neighbour < 4) {
                  const _loc1_ = compat.World.NeighboursSelect(neighbour, _loc3_, _loc2_);
                  if (_loc1_ != null) {
                     if (compat.World.IsPositionBlocked(_loc1_.row, _loc1_.col, compat.World.UnitsGetProfile(unit)) == false) {
                        gameMap_influence[_loc1_.row][_loc1_.col] = 1000;
                        gameMap_marker[_loc1_.row][_loc1_.col] = 2;
                     }
                  }
                  neighbour++;
               }
            }
         }
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
}

function AiInfluencePrepareMap_Fight(unit) {
   AiInfluenceClearScore();
   AiInfluenceClearMarker();
   AiInfluenceCreateThreat(unit);
   let _loc8_ = null;
   let _loc11_ = null;
   let _loc2_ = 0; // influence score for city
   let _loc7_ = 0;
   let _loc9_ = 0;
   let _loc10_ = undefined; // threat
   let _loc4_ = 0; // y
   while (_loc4_ < compat.World.rows) {
      let _loc3_ = 0; // x
      while (_loc3_ < compat.World.cols) {
         _loc2_ = 0;
         _loc10_ = gameMap_threat[_loc4_][_loc3_] + 1;
         _loc11_ = compat.World.getCity(_loc4_, _loc3_);
         if (_loc11_ != null) {
            _loc2_ = AiInfluenceGetScoreForCity(unit, _loc11_);
            if (_loc2_ > gameMap_influence[_loc4_][_loc3_]) {
               gameMap_influence[_loc4_][_loc3_] = _loc2_ / _loc10_;
               gameMap_marker[_loc4_][_loc3_] = 2;
            }
         }
         _loc8_ = compat.World.map.units[_loc4_][_loc3_];
         if (_loc8_ != null) {
            if (compat.World.PlayerAreEnemies(_loc8_.getPlayer(), unit.getPlayer()))
            {
               _loc9_ = AiInfluenceGetScoreForEnemyUnit(unit, _loc8_);
               if (gameMap_influence[_loc4_][_loc3_] != Ai_InvalidValue) {
                  _loc9_ = _loc9_ + gameMap_influence[_loc4_][_loc3_];
               }
               neighbour = 0;
               while (neighbour < 4) {
                  let _loc1_ = compat.World.NeighboursSelect(neighbour, _loc4_, _loc3_);
                  _loc2_ = _loc9_;
                  if (_loc1_ != null) {
                     let _loc6_ = compat.World.map.units[_loc1_.row][_loc1_.col];
                     _loc7_ = AiInfluenceGetScoreForTerrain(unit,_loc8_,_loc1_.row,_loc1_.col);
                     if (_loc7_ != Ai_InvalidValue) {
                        if (_loc6_ == null) {
                           _loc2_ = _loc2_ + _loc7_;
                        }
                        else if (_loc6_.equals(unit)) {
                           _loc2_ = _loc2_ + _loc7_ + 5;
                        }
                        else if (compat.World.PlayerAreEnemies(_loc6_.getPlayer(), unit.getPlayer())) {
                           _loc2_ = Ai_InvalidValue;
                        }
                        if (gameMap_influence[_loc1_.row][_loc1_.col] != Ai_InvalidValue) {
                           _loc2_ = (gameMap_influence[_loc1_.row][_loc1_.col] + _loc2_) / 2;
                        }
                        if (_loc2_ > gameMap_influence[_loc1_.row][_loc1_.col]) {
                           gameMap_influence[_loc1_.row][_loc1_.col] = _loc2_ / _loc10_;
                           gameMap_marker[_loc1_.row][_loc1_.col] = 2;
                        }
                     }
                  }
                  neighbour++;
               }
            }
         }
         if (unit.getMovementCost(compat.World.map.terrain[_loc4_][_loc3_].name) == GameMovement_BlockedField) {
            gameMap_marker[_loc4_][_loc3_] = -1;
         }
         _loc3_ = _loc3_ + 1;
      }
      _loc4_ = _loc4_ + 1;
   }
}

// Milestone: this is how far the first expedition made it.

function AiInfluenceFinalizeMap(item) {
   if (compat.World.DataUnitsGetBehaviour(compat.World.UnitsGetProfile(item)) == "FightOrMove" || compat.World.DataUnitsGetMinRange(compat.World.UnitsGetProfile(item)) > 1) {
      for (let i = 0; i < compat.World.unitList.length; i++) {
         const enemy = compat.World.unitList[i];
         if (compat.World.PlayerAreEnemies(enemy.getPlayer(), item.getPlayer())) {
            let neighbour = 0;
            while (neighbour < 4) {
               const _loc1_ = compat.World.NeighboursSelect(neighbour, item.row, item.col);
               if(_loc1_ != null) {
                  gameMap_influence[_loc1_.row][_loc1_.col] = Ai_InvalidValue;
               }
               neighbour++;
            }
         }
      }
   }
}

function AiInfluenceComputeMap(item) {
   let _loc2_ = undefined; // influence
   let path = 0; // row
   while (path < compat.World.rows) {
      let _loc5_ = 0; // row
      while (_loc5_ < compat.World.rows) {
         let _loc3_ = 0; // col
         while (_loc3_ < compat.World.cols) {
            if (compat.World.IsPositionBlocked(_loc5_, _loc3_, compat.World.UnitsGetProfile(item)) == false) {
               if (gameMap_marker[_loc5_][_loc3_] == 0) {
                  _loc2_ = -1;
                  let neighbour = 0;
                  while (neighbour < 4) {
                     const _loc1_ = compat.World.NeighboursSelect(neighbour, _loc5_, _loc3_);
                     if (_loc1_ != null) {
                        if (gameMap_marker[_loc1_.row][_loc1_.col] > 0) {
                           if (gameMap_influence[_loc1_.row][_loc1_.col] > _loc2_) {
                              _loc2_ = gameMap_influence[_loc1_.row][_loc1_.col];
                           }
                        }
                     }
                     neighbour++;
                  }
                  if (_loc2_ >= 0) {
                     _loc2_ = _loc2_ - item.getMovementCost(compat.World.map.terrain[_loc5_][_loc3_].name) * item.getMovementCost(compat.World.map.terrain[_loc5_][_loc3_].name) * 2;
                     if (compat.World.map.units[_loc5_][_loc3_] != null) {
                        const _loc6_ = compat.World.map.units[_loc5_][_loc3_];
                        if (compat.World.PlayerAreFriends(_loc6_.getPlayer(), item.getPlayer())) {
                           _loc2_ = _loc2_ - 2;
                        }
                     }
                     if (_loc2_ >= 0) {
                        gameMap_influence[_loc5_][_loc3_] = _loc2_;
                     }
                  }
               }
            }
            _loc3_ = _loc3_ + 1;
         }
         _loc5_ = _loc5_ + 1;
      }
      _loc5_ = 0; // row
      while (_loc5_ < compat.World.rows) {
         let _loc3_ = 0; // col
         while (_loc3_ < compat.World.cols) {
            if (gameMap_influence[_loc5_][_loc3_] != Ai_InvalidValue && gameMap_marker[_loc5_][_loc3_] == 0) {
               gameMap_marker[_loc5_][_loc3_] = 1;
            }
            _loc3_ = _loc3_ + 1;
         }
         _loc5_ = _loc5_ + 1;
      }
      path++;
   }
   let _loc5_ = 0; // row
   while (_loc5_ < compat.World.rows) {
      let _loc3_ = 0; // col
      while (_loc3_ < compat.World.cols) {
         if (gameMap_marker[_loc5_][_loc3_] == 2) {
            gameMap_influence[_loc5_][_loc3_] = gameMap_influence[_loc5_][_loc3_] * 2;
         }
         _loc3_ = _loc3_ + 1;
      }
      _loc5_ = _loc5_ + 1;
   }
}

function AiInfluenceGetScoreForEnemyUnit(item, enemy) {
   const _loc2_ = compat.World.computeDamage(item, enemy);
   let _loc1_ = compat.World.computeDamage(enemy, item);
   if (gameInfluence_baseBehaviour == AiInfluence_Passive) {
      _loc1_ = _loc1_ * 1.2;
   }
   return (_loc2_ - _loc1_) * 10;
}

function AiInfluenceGetScoreForCity(item, city) {
   if (compat.World.DataUnitsIsFlying(compat.World.UnitsGetProfile(item))) {
      return Ai_InvalidValue;
   }
   const _loc2_ = compat.World.map.units[city.row][city.col]; // unit
   if (_loc2_ == null && city.getPlayer() == null) {
      return AiInfluence_GetScoreForNeutralCity_NotOccupied(item, city);
   }
   if (_loc2_ != null && city.getPlayer() == null) {
      return AiInfluence_GetScoreForNeutralCity_Occupied(item, city, _loc2_);
   }
   if (_loc2_ == null && compat.World.PlayerAreFriends(city.getPlayer(), item.getPlayer())) {
      return AiInfluence_GetScoreForFriendlyCity_NotOccupied(item, city);
   }
   if (_loc2_ != null && compat.World.PlayerAreFriends(city.getPlayer(), item.getPlayer())) {
      return AiInfluence_GetScoreForFriendlyCity_Occupied(item, city, _loc2_);
   }
   if (_loc2_ == null && compat.World.PlayerAreEnemies(city.getPlayer(), item.getPlayer())) {
      return AiInfluence_GetScoreForEnemyCity_NotOccupied(item, city);
   }
   if (_loc2_ != null && compat.World.PlayerAreEnemies(city.getPlayer(), item.getPlayer())) {
      return AiInfluence_GetScoreForEnemyCity_Occupied(item, city, _loc2_);
   }
   console.log("AiInfluenceGetScoreForCity() ERROR!!!");
}

function AiInfluenceGetScoreForTerrain(item, unit, row, col) {
   if (compat.World.DataUnitsIsFlying(compat.World.UnitsGetProfile(item))) {
      return 0;
   }
   if (compat.World.IsPositionBlocked(row, col, compat.World.UnitsGetProfile(item))) {
      return Ai_InvalidValue;
   }
   if (compat.World.getCity(row, col) != null) {
      return 4;
   }
   return compat.World.map.terrain[row][col].getDefence();
}

function AiInfluence_GetScoreForNeutralCity_NotOccupied(item, city) {
   if(compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(item))) {
      return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 1.4;
   }
   return Ai_InvalidValue;
}

function AiInfluence_GetScoreForNeutralCity_Occupied(item, city, conqueror) {
   if (conqueror.equals(item)) {
      if (compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(conqueror))) {
         return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 2;
      }
      return Ai_InvalidValue;
   }
   if (compat.World.PlayerAreEnemies(conqueror.getPlayer(), item.getPlayer())) {
      return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 1.05;
   }
   if (compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(conqueror))) {
      return Ai_InvalidValue;
   }
   return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city));
}

function AiInfluence_GetScoreForFriendlyCity_NotOccupied(item, city) {
   if (gameMap_fortify[city.row][city.col] > 0) {
      if (compat.World.CitiesIsProductionFacility(city)) {
         if (item.getPlayer().getGold() > compat.World.DataUnitsGetPrice(DataUnit_ProfileId_Infantry)) {
            return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 0.3;
         }
      }
      return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 1.5;
   }
   if (gameInfluence_baseBehaviour == AiInfluence_Aggressive) {
      return Ai_InvalidValue;
   }
   return 20;
}
function AiInfluence_GetScoreForFriendlyCity_Occupied(item, city, conqueror) {
   if (compat.World.PlayerAreEnemies(conqueror.getPlayer(), item.getPlayer())) {
      if (compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(conqueror))) {
         return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 1.5;
      }
      return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city));
   }
   if (gameMap_fortify[city.row][city.col] > 0) {
      if (item.equals(conqueror)) {
         if (compat.World.CitiesIsProductionFacility(city)) {
            if (item.getPlayer().getGold() > compat.World.DataUnitsGetPrice(DataUnit_ProfileId_Infantry)) {
               return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 0.3;
            }
         }
         return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 1.5;
      }
      return Ai_InvalidValue;
   }
   return Ai_InvalidValue;
}

function AiInfluence_GetScoreForEnemyCity_NotOccupied(item, city) {
   if (compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(item))) {
      if (gameInfluence_baseBehaviour == AiInfluence_Aggressive) {
         return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 1.1;
      }
      return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 0.8;
   }
   return Ai_InvalidValue;
}

function AiInfluence_GetScoreForEnemyCity_Occupied(item, city, conqueror) {
   if (compat.World.DataUnitsCanCaptureCity(compat.World.UnitsGetProfile(item))) {
      if (gameInfluence_baseBehaviour == AiInfluence_Aggressive) {
         return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 0.5;
      }
      return compat.World.DataCitiesGetScore(compat.World.CitiesGetProfile(city)) * 0.25;
   }
   return Ai_InvalidValue;
}

function AiInfluenceClearScore() {
   gameMap_influence = [];
   let _loc2_ = 0; // row
   while (_loc2_ < compat.World.rows) {
      gameMap_influence[_loc2_] = [];
      let _loc1_ = 0; // col
      while (_loc1_ < compat.World.cols) {
         gameMap_influence[_loc2_][_loc1_] = Ai_InvalidValue;
         _loc1_ = _loc1_ + 1;
      }
      _loc2_ = _loc2_ + 1;
   }
}

function AiInfluenceClearFortify() {
   gameMap_fortify = [];
   let _loc2_ = 0;
   while (_loc2_ < compat.World.rows) {
      gameMap_fortify[_loc2_] = [];
      let _loc1_ = 0;
      while(_loc1_ < compat.World.cols)
      {
         gameMap_fortify[_loc2_][_loc1_] = 0;
         _loc1_ = _loc1_ + 1;
      }
      _loc2_ = _loc2_ + 1;
   }
}

function AiInfluenceClearMarker() {
   gameMap_marker = [];
   let _loc2_ = 0;
   while (_loc2_ < compat.World.rows) {
      gameMap_marker[_loc2_] = [];
      let _loc1_ = 0;
      while (_loc1_ < compat.World.cols) {
         gameMap_marker[_loc2_][_loc1_] = 0;
         _loc1_ = _loc1_ + 1;
      }
      _loc2_ = _loc2_ + 1;
   }
}

function AiInfluenceSet(row, col, influence) {
   gameMap_influence[row][col] = influence;
}

function AiInfluenceClearThreat() {
   gameMap_threat = [];
   let _loc2_ = 0;
   while (_loc2_ < compat.World.rows) {
      gameMap_threat[_loc2_] = [];
      let _loc1_ = 0;
      while (_loc1_ < compat.World.cols) {
         gameMap_threat[_loc2_][_loc1_] = 0;
         _loc1_ = _loc1_ + 1;
      }
      _loc2_ = _loc2_ + 1;
   }
}
function AiInfluenceCreateThreat(item) {
   AiInfluenceClearThreat();
   const _loc6_ = item.getPlayer(); // player
   for (let i = 0; i < compat.World.unitList.length; i++) {
      const _loc1_ = compat.World.unitList[i]; // unit
      if (compat.World.PlayerAreEnemies(_loc1_.getPlayer(), _loc6_)) {
         const _loc3_ = compat.World.DataUnitsGetRange(compat.World.UnitsGetProfile(_loc1_));
         if (_loc3_ > 1) {
            const _loc4_ = compat.World.UnitsGetNumberOfFights(_loc1_, item, 0);
            if (_loc4_ > 1) {
               let _loc2_ = 1;
               if (_loc4_ > 3) {
                  _loc2_ = 3;
               } else if (_loc4_ > 2) {
                  _loc2_ = 2;
               }
               const _loc5_ = compat.World.DataUnitsGetMinRange(compat.World.UnitsGetProfile(_loc1_));
               let range = _loc5_;
               while (range < _loc3_ + 1) {
                  AiInfluenceCreateThreatRing(_loc1_.row, _loc1_.col, range, _loc2_);
                  range++;
               }
            }
         }
      }
   }
}

function AiInfluenceCreateThreatRing(row, col, range, threat) {
   let _loc1_ = {};
   _loc1_.row = row;
   _loc1_.col = col;
   let i = 0;
   while (i < range) {
      // The argument 3 is potentially a bug.
      // Why only create a threat ring to the left? (Maybe that's the strength?)
      _loc1_ = compat.World.NeighboursSelect(3, _loc1_.row, _loc1_.col);
      i++;
   }
   let neighbour = 0;
   while (neighbour < 4) {
      i = 0;
      while (i < range) {
         switch (neighbour) {
            case 0:
               _loc1_.row = _loc1_.row - 1;
               _loc1_.col = _loc1_.col + 1;
               break;
            case 1:
               _loc1_.row = _loc1_.row + 1;
               _loc1_.col = _loc1_.col + 1;
               break;
            case 2:
               _loc1_.row = _loc1_.row + 1;
               _loc1_.col = _loc1_.col - 1;
               break;
            case 3:
               _loc1_.col = _loc1_.col - 1;
               _loc1_.row = _loc1_.row - 1;
         }
         if (_loc1_.row >= 0 && _loc1_.row <= compat.World.rows && _loc1_.col >= 0 && _loc1_.col <= compat.World.cols) {
            gameMap_threat[_loc1_.row][_loc1_.col] = gameMap_threat[_loc1_.row][_loc1_.col] + threat;
         }
         i++;
      }
      neighbour++;
   }
}

function AiToolsMove(item, range) {
   console.log("AiToolsMove( " + item + ", " + range + " )");
   compat.World.createMovement(item, true);
   let _loc4_ = gameMap_influence[item.row][item.col];
   let _loc7_ = item.row;
   let _loc6_ = item.col;
   let _loc3_ = undefined;

   let _loc2_ = 0; // row
   while (_loc2_ < compat.World.rows) {
      let _loc1_ = 0; // col
      while (_loc1_ < compat.World.cols) {
         if (compat.World.map.movement[_loc2_][_loc1_] > 0 && compat.World.map.movement[_loc2_][_loc1_] <= range) {
            if (compat.World.map.units[_loc2_][_loc1_] == null || compat.World.map.units[_loc2_][_loc1_] == item) {
               _loc3_ = gameMap_influence[_loc2_][_loc1_];
               if (_loc3_ > _loc4_) {
                  _loc4_ = _loc3_;
                  _loc7_ = _loc2_;
                  _loc6_ = _loc1_;
               }
            }
         }
         _loc1_ = _loc1_ + 1;
      }
      _loc2_ = _loc2_ + 1;
   }
   if (compat.World.map.units[_loc7_][_loc6_] == null) {
      compat.World.game.Marker.setPos(_loc7_, _loc6_);
      item.move(_loc7_, _loc6_);
   }
}

function AiToolsBattle(item) {
   compat.World.createBattle(item);
   console.log("BattleDescription: " + compat.World.BattleDescription[0]);
   const _loc1_ = AiToolsSearchBestBattleDescription(item, false);
   // accesses nullable before null-check:
   //console.log(_loc1_[0] + " " + _loc1_[1] + " " + _loc1_[2].type);
   if (_loc1_ != null) {
      compat.World.game.Marker.setPos(_loc1_[0], _loc1_[1]);
      compat.World.executeBattle(item, _loc1_[2]);
      console.log(_loc1_[0] + " " + _loc1_[1] + " " + _loc1_[2].type);
      if (compat.World.map.units[_loc1_[0]][_loc1_[1]] == null) {
         AiInfluencePrepareMap_Fortify(item.player);
      }
   }
   compat.World.destroyBattle();
}

function AiToolsSearchBestUnit_GameUnitsItem(player, category) {
   let _loc3_ = Ai_InvalidValue;
   let _loc4_ = null;
   let _loc2_ = Ai_InvalidValue;
   for (let i = 0; i < compat.World.unitList.length; i++) {
      const _loc1_ = compat.World.unitList[i];
      if (_loc1_.player.equals(player) && _loc1_.state == Unit_State_WaitingForOrder && _loc1_.getTypeCat() == category) {
         _loc2_ = gameMap_influence[_loc1_.row][_loc1_.col];
         if (_loc2_ > _loc3_) {
            _loc3_ = _loc2_;
            _loc4_ = _loc1_;
         }
      }
   }
   return _loc4_;
}

function AiToolsSearchBestBattleDescription(attacker, farRangeAttack) {
   let _loc6_ = null;
   let _loc4_ = 0;
   let _loc1_ = 0;
   for (let i = 0; i < compat.World.BattleDescription.length; i++) {
      const _loc3_ = compat.World.BattleDescription[i];
      const _loc2_ = _loc3_[2];
      console.log("defender " + _loc2_.type);
      _loc1_ = AiInfluenceGetScoreForEnemyUnit(attacker, _loc2_) + 50;
      console.log("score " + _loc1_);
      if (farRangeAttack) {
         if (attacker.computeDistance(_loc2_) > 1) {
            _loc1_ = _loc1_ + 500;
         } else {
            _loc1_ = _loc1_ - 600;
         }
      }
      if (_loc1_ > _loc4_) {
         _loc6_ = _loc3_;
         _loc4_ = _loc1_;
      }
   }
   return _loc6_;
}

function AiReportCreate_AiReportDefinition(player0, player1) {
   const _loc13_ = compat.World.UnitsCount(player0, "Human");
   const _loc10_ = compat.World.UnitsCount(player1, "Human");
   const _loc2_ = _loc13_ + _loc10_;
   const _loc16_ = compat.World.UnitsCount(player0, "Soft");
   const _loc15_ = compat.World.UnitsCount(player1, "Soft");
   const _loc4_ = _loc16_ + _loc15_;
   const _loc8_ = compat.World.UnitsCount(player0, "Hard");
   const _loc17_ = compat.World.UnitsCount(player1, "Hard");
   const _loc6_ = _loc8_ + _loc17_;
   const _loc11_ = compat.World.UnitsCount(player0, "Air");
   const _loc9_ = compat.World.UnitsCount(player1, "Air");
   const _loc5_ = _loc11_ + _loc9_;
   const _loc14_ = compat.World.UnitsCount(player0, "Water");
   const _loc12_ = compat.World.UnitsCount(player1, "Water");
   const _loc7_ = _loc14_ + _loc12_;
   report.human = 0;
   report.soft = 0;
   report.hard = 0;
   report.air = 0;
   report.water = 0;
   if (_loc2_ != 0) {
      report.human = _loc13_ * 100 / _loc2_ - _loc10_ * 100 / _loc2_;
   }
   if (_loc4_ != 0) {
      report.soft = _loc16_ * 100 / _loc4_ - _loc15_ * 100 / _loc4_;
   }
   if (_loc6_ != 0) {
      report.hard = _loc8_ * 100 / _loc6_ - _loc17_ * 100 / _loc6_;
   }
   if (_loc5_ != 0) {
      report.air = _loc11_ * 100 / _loc5_ - _loc9_ * 100 / _loc5_;
   }
   if (_loc7_ != 0) {
      report.water = _loc14_ * 100 / _loc7_ - _loc12_ * 100 / _loc7_;
   }
   return report;
}

function AiReportGetBalanceLevel(report, category) {
   if (report == null) {
      console.log("invalid report");
   }
   switch(category) {
      case "Human":
         return report.human;
      case "Soft":
         return report.soft;
      case "Hard":
         return report.hard;
      case "Air":
         return report.air;
      case "HighAir":
      case "Water":
         return report.water;
      default:
         console.log("unknown report category!");
   }
}

function AiReportHasAdvantage(player) {
   const _loc1_ = compat.World.UnitsCountEnemyHitpoints(player);
   const _loc2_ = compat.World.UnitsCountFriendlyHitpoints(player) * 1.1;
   return _loc2_ > _loc1_;
}
function AiBuyUnitsCreate() {
   AiWishlistCreate();
}
function AiBuyUnitsDestroy() {
   AiWishlistDestroy();
}

// This is where the second expedition ran out of energy bars (Apr 14, 2022).

function AiBuyUnitsExecute(player) {
   if (player.getGold() < 10) {
      return;
   }
   AiWishlistReset();
   if (compat.World.CitiesCanProduceUnit(player, "Human")) {
      const _loc9_ = compat.World.CitiesCountNeutral(player, "Town");
      const _loc7_ = compat.World.UnitsCount(player, "Human");
      if (_loc9_ > _loc7_) {
         AiBuyUnitsAddToWishlist(player, "Human");
         AiBuyUnitsFromWishlist("rule1", player);
         return;
      }
      const _loc8_ = compat.World.CitiesCountOccupied(player, "Town");
      if (_loc8_ > _loc7_) {
         AiBuyUnitsAddToWishlist(player, "Human");
         AiBuyUnitsFromWishlist("rule2", player);
      }
   }
   let catCount = 0;
   const unitCategories = ["Human", "Hard", "Soft", "Water", "Air"];
   while (catCount < unitCategories) {
      const _loc4_ = unitCategories[catCount]; // unit category
      const _loc6_ = compat.World.UnitsCountEnemyHitpoints(player, _loc4_);
      const _loc5_ = compat.World.UnitsCountCounterHitpoints(player, _loc4_);
      if (_loc5_ < _loc6_) {
         let profCount = 0;
         while (profCount < UnitDataObjects.length) {
            const _loc3_ = UnitDataObjects[profCount];
            if (_loc3_) {
               if (compat.World.DataUnitsGetPrice(_loc3_) < player.getGold() && compat.World.DataUnitsGetQuality(_loc3_) > 0) {
                  if (compat.World.CitiesCanProduceUnit(player, _loc3_.type)) {
                     let strength = 1;
                     while (strength < compat.World.DataUnitsGetAttackStrengthAgainstCategory(_loc3_, _loc4_)) {
                        AiWishlistAdd(_loc3_);
                        strength++;
                     }
                  }
               }
            }
            profCount++;
         }
      }
      catCount++;
   }
   if (AiWishlistIsEmpty() == false) {
      AiBuyUnitsFromWishlist("rule3", player);
      return;
   }
   if (player.getGold() > 60 || myRnd(0, 100) > 80){
      let profCount = 0;
      while (profCount < UnitDataObjects.length) {
         const _loc3_ = UnitDataObjects[profCount];
         if (_loc3_) {
            if (compat.World.DataUnitsGetPrice(_loc3_) < player.getGold()) {
               if (compat.World.CitiesCanProduceUnit(player, _loc3_)) {
                  let quality = 1;
                  while (quality < compat.World.DataUnitsGetQuality(_loc3_)) {
                     AiWishlistAdd(_loc3_);
                     quality++;
                  }
               }
            }
         }
         profCount++;
      }
      AiBuyUnitsFromWishlist("rule4", player);
   }
}

function AiBuyUnitsFromWishlist(rule, player) {
   if (AiWishlistIsEmpty()) {
      return;
   }
   const _loc3_ = AiWishlistGetRandomProfile(); // profile
   for (let i = 0; i < compat.World.cityList.length; i++) {
      const _loc1_ = compat.World.cityList[i];
      if (_loc1_.getPlayer() && _loc1_.getPlayer().equals(player)) {
         const _loc2_ = compat.World.DataUnitsGetProduction(_loc3_);
         if (_loc1_.type == _loc2_ && compat.World.map.units[_loc1_.row][_loc1_.col] == null) {
            compat.World.game.Marker.setPos(_loc1_.row ,_loc1_.col);
            player.buyUnit(_loc3_.name, _loc1_.row, _loc1_.col);
            return;
         }
      }
   }
}

function AiBuyUnitsAddToWishlist(player, category) {
   if (compat.World.game.Round < 6 && category == "Human") {
      AiWishlistAdd(DataUnit_ProfileId_Infantry);
      return;
   }
   let profCount = 0;
   while (profCount < UnitDataObjects.length) {
      var _loc2_ = UnitDataObjects[profCount];
      if (_loc2_) {
         if (compat.World.DataUnitsGetCategory(_loc2_) == category && compat.World.DataUnitsGetPrice(_loc2_) < player.getGold()) {
            let quality = 1;
            while (quality < compat.World.DataUnitsGetQuality(_loc2_)) {
               AiWishlistAdd(_loc2_);
               quality++;
            }
         }
      }
      profCount++;
   }
}

function myRnd(min, max) {
   return min + Math.floor(Math.random() * (max + 1 - min));
}

function AiSystemCreate() {
   console.log("AiSystemCreate( world )");
   AiBuyUnitsCreate();
}

function AiSystemDestroy() {
   console.log("AiSystemDestroy()");
   AiBuyUnitsDestroy();
}

function AiSystemExecute(player) {
   // TODO check if necessary, following vars never used before
   /**
    * AiSystemExecute()
    * while (AiSystemExecuteStep()) {
    *    delay();
    * }
    */
   AIexecutionState = 0;
   AiSystemDone = false;
   AiSystemExecuteINT = setInterval(AiSystemExecuteStep, 500, player);
}

function AiSystemExecuteStep(player) {
   let returnValue = AI_STEP_TYPE.NOTHING
   switch (AIexecutionState) {
      case 0:
         AiBuyUnitsExecute(player);
         AiSystemExecute_BehaviourHandling(player);
         AiSystemExecute_MoveWeakUnits(player);
         break;
      case 1:
         if (!AiSystemMoveWeakUnitsDone) {
            return returnValue;
         }
         AiInfluencePrepareMap_Fortify(player);
         AiSystemExecute_FightOrMoveUnits(player);
         break;
      case 2:
         if (!AiSystemMoveOrFightDone) {
            return returnValue;
         }
         AiSystemExecute_StandardUnits(player, 10, 1);
         break;
      case 3:
         if(!AiSystemStandardUnitsDone) {
            return returnValue;
         }
         AiBuyUnitsExecute(player);
         AiSystemExecute_StandardUnits(player, 100, 0);
         break;
      case 4:
         if (!AiSystemStandardUnitsDone) {
            return returnValue;
         }
         AiSystemExecute_StandardUnits(player, 60, 0);
         break;
      case 5:
         if(!AiSystemStandardUnitsDone) {
            return returnValue;
         }
         AiBuyUnitsExecute(player);
         AiSystemExecute_BehaviourHandling(player);
         AiSystemExecute_StandardUnits(player, 30, 0);
         break;
      case 6:
         if(!AiSystemStandardUnitsDone) {
            return returnValue;
         }
         AiBuyUnitsExecute(player);
         AiSystemExecute_StandardUnits(player, Ai_InvalidValue, 0);
         break;
      case 7:
         if (!AiSystemStandardUnitsDone) {
            return returnValue;
         }
         AiBuyUnitsExecute(player);
         clearInterval(AiSystemExecuteINT);
         AiSystemDone = true;
         returnValue = AI_STEP_TYPE.END_TURN
         compat.World.game.nextTurn();
         break;
      default:
         console.log("AIexecutionState ERROR!");
   }
   AIexecutionState++;
   return returnValue
}

function AiSystemExecute_BehaviourHandling(player) {
   if (AiReportHasAdvantage(player)) {
      AiInfluenceSetBaseBehaviour(AiInfluence_Aggressive);
   } else {
      AiInfluenceSetBaseBehaviour(AiInfluence_Passive);
   }
}

function AiSystemExecute_MoveWeakUnits(player) {
   UnitCounter = 0;
   AiSystemMoveWeakUnitsDone = false;
   AiSystemExecute_MoveWeakUnitsStep(player);
}

function AiSystemExecute_MoveWeakUnitsStep(player) {
   if (UnitCounter >= compat.World.unitList.length) {
      AiSystemMoveWeakUnitsDone = true;
   } else {
      const unit = compat.World.unitList[UnitCounter];
      console.log("unit.type: " + unit.type);
      if (unit.getPlayer().equals(player)) {
         if (unit.getState() == Unit_State_WaitingForOrder) {
            let _loc2_ = false;
            if (unit.GetHitpointsInPercent() < 45) {
               _loc2_ = true;
            }
            if (unit.GetAmmoInPercent() < 25) {
               _loc2_ = true;
            }
            if (unit.GetFuelInPercent() < 25) {
               _loc2_ = true;
            }
            if (_loc2_ && unit.getState() != Unit_State_Finished) {
               AiInfluencePrepareMap_Supply(unit);
               AiInfluenceComputeMap(unit);
               AiInfluenceFinalizeMap(unit);
               AiToolsMove(unit, unit.getMovement());
               // TODO transfer to executeStep/outside, see function below
               AiSystemExecute_MoveWeakUnitsINT = setInterval(AiSystemExecute_MoveWeakUnitsWait, 500, unit);
               return;
            }
         }
      }
      UnitCounter++;
      AiSystemExecute_MoveWeakUnitsStep(player);
   }
}

function AiSystemExecute_MoveWeakUnitsWait(unit) {
   // TODO not an AI task; remove
   if (!unit.isMoving) {
      clearInterval(AiSystemExecute_MoveWeakUnitsINT);
      unit.state = Unit_State_Finished;
      UnitCounter++;
      AiSystemExecute_MoveWeakUnitsStep(unit.player);
   }
}

function AiSystemExecute_FightOrMoveUnits(player) {
   UnitCounter = 0;
   AiSystemMoveOrFightDone = false;
   AiSystemExecute_FightOrMoveUnitsStep(player);
}

function AiSystemExecute_FightOrMoveUnitsStep(player) {
   if (UnitCounter >= compat.World.unitList.length) {
      AiSystemMoveOrFightDone = true;
   } else {
      const unit = compat.World.unitList[UnitCounter];
      if (unit.getPlayer().equals(player) && unit.getState() == Unit_State_WaitingForOrder) {
         const _loc4_ = unit.getBehavior();
         if (_loc4_ == "FightOrMove") {
            console.log("unit found" + unit.type);
            const _loc3_ = compat.World.getCity(unit.row, unit.col);
            if (_loc3_ != null) {
               if (compat.World.CitiesIsProductionFacility(_loc3_)) {
                  if (player.getGold() > compat.World.DataUnitsGetPrice(DataUnit_ProfileId_Infantry)) {
                     AiToolsBattle(unit);
                     // TODO: move to execute step (long term)
                     DisplayBattleINT = setTimeout(AiSystemExecute_FightOrMoveUnitsStepDone, 4000, player, unit);
                     return;
                  }
               }
            }
            AiToolsBattle(unit);
            // TODO: move to execute step (long term)
            DisplayBattleINT = setTimeout(AiSystemExecute_FightOrMoveUnitsStepDone, 4000, player, unit);
            return;
         }
      }
      UnitCounter++;
      AiSystemExecute_FightOrMoveUnitsStep(player);
   }
}

function AiSystemExecute_FightOrMoveUnitsStepDone(player, unit) {
   if (unit != undefined) {
      UnitCounter++;
   }
   AiSystemExecute_FightOrMoveUnitsStep(player);
}

function AiSystemExecute_StandardUnits(player, score, range) {
   console.log("AiSystemExecute_StandardUnits()");
   UnitCounter = 0;
   AiSystemStandardUnitsDone = false;
   AiSystemExecute_StandardUnitsStep(player, score, range);
}

function AiSystemExecute_StandardUnitsStep(player, score, range) {
   if (UnitCounter >= compat.World.unitList.length) {
      AiSystemStandardUnitsDone = true;
   }
   else {
      const unit = compat.World.unitList[UnitCounter];
      if (unit.getPlayer().equals(player) && unit.getState() == Unit_State_WaitingForOrder && unit.getRange() > range) {
         console.log("try to fight");
         AiInfluencePrepareMap_Fight(unit);
         AiInfluenceComputeMap(unit);
         AiInfluenceFinalizeMap(unit);
         const _loc2_ = gameMap_influence[unit.row][unit.col];
         console.log("influence = " + _loc2_);
         console.log("score = " + score);
         if (_loc2_ >= score) {
            AiToolsMove(unit, unit.getMovement());
            // TODO: remove interval
            AiSystemExecute_StandardUnitsINT = setInterval(AiSystemExecute_StandardUnitsWait, 500, unit, score, range);
            return;
         }
      }
      UnitCounter++;
      AiSystemExecute_StandardUnitsStep(player, score, range);
   }
}

function AiSystemExecute_StandardUnitsWait(unit, score, range) {
   if (!unit.isMoving) {
      var _loc3_ = unit.player;
      // TODO: remove interval
      clearInterval(AiSystemExecute_StandardUnitsINT);
      if (unit.getState() != Unit_State_Finished) {
         console.log("attack");
         AiToolsBattle(unit);
         // TODO: remove interval
         DisplayBattleINT = setTimeout(AiSystemExecute_StandardUnitsAttackDone, 4000, _loc3_, score, range, unit);
         return;
      }
      UnitCounter++;
      AiSystemExecute_StandardUnitsStep(_loc3_, score, range);
   }
}

function AiSystemExecute_StandardUnitsAttackDone(player, score, range, unit) {
   if (unit) {
      UnitCounter++;
      unit.state = Unit_State_Finished;
   }
   AiSystemExecute_StandardUnitsStep(player, score, range);
}
