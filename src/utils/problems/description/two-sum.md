給定一個整數陣列 `nums` 和一個整數 `target`，返回兩個數字的索引，使它們的和等於目標值。

你可以假設每個輸入都只有一個解，而且你不能使用同一個元素兩次。

你可以以任何順序輸出答案。

---

### 範例 1:

> Input: nums = [2,7,11,15], target = 9
>
> Output:[0,1]
>
> Explanation: Because nums[0] + nums[1] == 9, we return

### 範例 2:

> Input: nums = [3,2,4], target = 6
> Output:[1,2]
> Explanation: Because nums[1] + nums[2] == 6, we return [1, 2].

### 範例 3:

> Input: nums = [3,3], target = 6
> Output:[0,1]

### Constraints:

- 2 ≤ nums.length ≤ 10
- -10 ≤ nums[i] ≤ 10
- -10 ≤ target ≤ 10

- Only one valid answer exists.
