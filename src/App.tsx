import { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  ShoppingBag,
  Users,
  Calculator,
  // Calendar,
  Home,
} from "lucide-react";
import type { Member, ShoppingItem, MealEntry, RentCost } from "./types";

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [rentCosts, setRentCosts] = useState<RentCost[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newRentAmount, setNewRentAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [activeTab, setActiveTab] = useState<
    "members" | "shopping" | "calculation" | "rent"
  >("members");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const addMember = () => {
    if (newMemberName.trim()) {
      setMembers([
        ...members,
        {
          id: Date.now().toString(),
          name: newMemberName.trim(),
          created_by: "user",
        },
      ]);
      setNewMemberName("");
    }
  };

  const getMealCount = (memberId: string, date: string) => {
    const entry = mealEntries.find(
      (e) => e.member_id === memberId && e.date === date
    );
    return entry?.count || 0;
  };

  const updateMealCount = (
    memberId: string,
    date: string,
    increment: boolean
  ) => {
    const existingEntryIndex = mealEntries.findIndex(
      (e) => e.member_id === memberId && e.date === date
    );

    if (existingEntryIndex >= 0) {
      const newCount = increment
        ? mealEntries[existingEntryIndex].count + 1
        : Math.max(0, mealEntries[existingEntryIndex].count - 1);

      const updatedEntries = [...mealEntries];
      updatedEntries[existingEntryIndex] = {
        ...updatedEntries[existingEntryIndex],
        count: newCount,
      };
      setMealEntries(updatedEntries);
    } else if (increment) {
      setMealEntries([
        ...mealEntries,
        {
          id: Date.now().toString(),
          member_id: memberId,
          date,
          count: 1,
          created_by: "user",
          updated_by: "user",
        },
      ]);
    }
  };

  const addShoppingItem = () => {
    if (newItemName.trim() && !isNaN(Number(newItemCost))) {
      setShoppingList([
        ...shoppingList,
        {
          id: Date.now().toString(),
          name: newItemName.trim(),
          cost: Number(newItemCost),
          date: selectedDate,
          created_by: "user",
          updated_by: "user",
        },
      ]);
      setNewItemName("");
      setNewItemCost("");
    }
  };

  const addRentCost = () => {
    if (!isNaN(Number(newRentAmount))) {
      setRentCosts([
        ...rentCosts,
        {
          id: Date.now().toString(),
          month: selectedMonth + "-01",
          amount: Number(newRentAmount),
          created_by: "user",
          updated_by: "user",
        },
      ]);
      setNewRentAmount("");
    }
  };

  const calculateMonthlyCosts = () => {
    const monthStart = selectedMonth + "-01";
    const monthEnd = selectedMonth + "-31";

    const monthlyShoppingList = shoppingList.filter(
      (item) => item.date >= monthStart && item.date <= monthEnd
    );

    const monthlyMealEntries = mealEntries.filter(
      (entry) => entry.date >= monthStart && entry.date <= monthEnd
    );

    const monthlyRent =
      rentCosts.find((rent) => rent.month.startsWith(selectedMonth))?.amount ||
      0;

    const totalCost = monthlyShoppingList.reduce(
      (sum, item) => sum + item.cost,
      0
    );
    const totalMeals = monthlyMealEntries.reduce(
      (sum, entry) => sum + entry.count,
      0
    );
    const perMealCost = totalMeals > 0 ? totalCost / totalMeals : 0;
    const perPersonRent = members.length > 0 ? monthlyRent / members.length : 0;

    return {
      month: selectedMonth,
      totalCost,
      perMealCost,
      rentCost: monthlyRent,
      perPersonRent,
      memberCosts: members.map((member) => {
        const memberMealCount = monthlyMealEntries
          .filter((entry) => entry.member_id === member.id)
          .reduce((sum, entry) => sum + entry.count, 0);
        const mealCost = memberMealCount * perMealCost;
        return {
          memberId: member.id,
          name: member.name,
          mealCount: memberMealCount,
          mealCost,
          rentShare: perPersonRent,
          totalCost: mealCost + perPersonRent,
        };
      }),
    };
  };

  const getMemberMeals = (memberId: string) => {
    const monthStart = selectedMonth + "-01";
    const monthEnd = selectedMonth + "-31";

    return mealEntries
      .filter(
        (entry) =>
          entry.member_id === memberId &&
          entry.date >= monthStart &&
          entry.date <= monthEnd
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const costs = calculateMonthlyCosts();

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === "members" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="inline-block mr-2 h-5 w-5" />
            Members
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === "shopping"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("shopping")}
          >
            <ShoppingBag className="inline-block mr-2 h-5 w-5" />
            Shopping
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === "rent" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("rent")}
          >
            <Home className="inline-block mr-2 h-5 w-5" />
            Rent
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === "calculation"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("calculation")}
          >
            <Calculator className="inline-block mr-2 h-5 w-5" />
            Costs
          </button>
        </div>

        {activeTab === "members" && !selectedMember && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member name"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addMember}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="mb-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <button
                    className="font-medium text-left flex-1"
                    onClick={() => setSelectedMember(member.id)}
                  >
                    {member.name}
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateMealCount(member.id, selectedDate, false)
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <MinusCircle className="h-6 w-6" />
                    </button>
                    {/* <span className="w-8 text-center font-semibold"> */}
                    <input
                      type="number"
                      value={newItemCost}
                      onChange={(e) => setNewItemCost(e.target.value)}
                      placeholder="Cost"
                      className="w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* </span> */}
                    <button
                      onClick={() =>
                        updateMealCount(member.id, selectedDate, true)
                      }
                      className="text-green-500 hover:text-green-600"
                    >
                      <PlusCircle className="h-6 w-6" />
                    </button>
                    <button
                      className="text-gray-200 bg-green-700 p-2 hover:bg-green-600 rounded-lg"
                      onClick={() => {
                        getMealCount(member.id, selectedDate);
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "members" && selectedMember && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {members.find((m) => m.id === selectedMember)?.name}'s Meals
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-blue-500 hover:text-blue-600"
              >
                Back
              </button>
            </div>
            <div className="mb-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              {getMemberMeals(selectedMember).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div className="font-medium">{entry.date}</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateMealCount(selectedMember, entry.date, false)
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <MinusCircle className="h-6 w-6" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {entry.count}
                    </span>
                    <button
                      onClick={() =>
                        updateMealCount(selectedMember, entry.date, true)
                      }
                      className="text-green-500 hover:text-green-600"
                    >
                      <PlusCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "shopping" && (
          <div>
            <div className="mb-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                placeholder="Cost"
                className="w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addShoppingItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="space-y-3">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.date}</div>
                  </div>
                  <div className="font-semibold">${item.cost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rent" && (
          <div>
            <div className="mb-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={newRentAmount}
                onChange={(e) => setNewRentAmount(e.target.value)}
                placeholder="Rent amount"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addRentCost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="space-y-3">
              {rentCosts
                .filter((rent) => rent.month.startsWith(selectedMonth))
                .map((rent) => (
                  <div
                    key={rent.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="font-medium">
                      Rent for {rent.month.slice(0, 7)}
                    </div>
                    <div className="font-semibold">
                      ${rent.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "calculation" && (
          <div className="space-y-6">
            <div className="mb-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="text-lg font-semibold mb-2">Monthly Summary</div>
              <div className="flex justify-between">
                <span>Total Meal Cost:</span>
                <span className="font-semibold">
                  ${costs.totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cost per Meal:</span>
                <span className="font-semibold">
                  ${costs.perMealCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Rent:</span>
                <span className="font-semibold">
                  ${costs.rentCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rent per Person:</span>
                <span className="font-semibold">
                  ${costs.perPersonRent.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {costs.memberCosts.map(
                ({
                  memberId,
                  name,
                  mealCount,
                  mealCost,
                  rentShare,
                  totalCost,
                }) => (
                  <div
                    key={memberId}
                    className="bg-gray-50 p-4 rounded-lg space-y-2"
                  >
                    <div className="font-medium text-lg">{name}</div>
                    <div className="text-sm text-gray-500">
                      {mealCount} meals
                    </div>
                    <div className="flex justify-between">
                      <span>Meal Cost:</span>
                      <span className="font-semibold">
                        ${mealCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rent Share:</span>
                      <span className="font-semibold">
                        ${rentShare.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
