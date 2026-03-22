-- ─────────────────────────────────────────────────────────────────────────────
-- LeetBattle — seed: 10 MEDIUM problems (IDs 11–20) + test cases
-- ─────────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- 11. Longest Substring Without Repeating Characters
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  11,
  'longest-substring-without-repeating-characters',
  'Longest Substring Without Repeating Characters',
  'medium',
  ARRAY['hash-table','string','sliding-window'],
  E'Given a string `s`, find the length of the **longest substring** without repeating characters.\n\nA **substring** is a contiguous non-empty sequence of characters within a string.',
  '[
    {"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."},
    {"input": "s = \"bbbbb\"", "output": "1", "explanation": "The answer is \"b\", with the length of 1."},
    {"input": "s = \"pwwkew\"", "output": "3", "explanation": "The answer is \"wke\", with the length of 3. Note that \"pwke\" is a subsequence, not a substring."}
  ]'::jsonb,
  ARRAY['0 <= s.length <= 50000', 's consists of English letters, digits, symbols and spaces.'],
  true,
  '{
    "python3": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};",
    "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};"
  }'::jsonb,
  'lengthOfLongestSubstring',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(11, '{"s": "abcabcbb"}', '3', true, 8, 1),
(11, '{"s": "bbbbb"}', '1', true, 5, 2),
(11, '{"s": "pwwkew"}', '3', true, 6, 3),
(11, '{"s": ""}', '0', false, 0, 4),
(11, '{"s": " "}', '1', false, 1, 5),
(11, '{"s": "dvdf"}', '3', false, 4, 6),
(11, '{"s": "abcdefghijklmnopqrstuvwxyz"}', '26', false, 26, 7),
(11, ('{"s": "' || repeat('abcdefghij', 200) || '"}')::jsonb, '10'::jsonb, false, 2000, 8);


-- ============================================================================
-- 12. 3Sum
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  12,
  'three-sum',
  '3Sum',
  'medium',
  ARRAY['array','two-pointers','sorting'],
  E'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.\n\nReturn the triplets in any order. Each triplet must be sorted in non-decreasing order.',
  '[
    {"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]", "explanation": "nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0. nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0. The distinct triplets are [-1,0,1] and [-1,-1,2]."},
    {"input": "nums = [0,1,1]", "output": "[]", "explanation": "The only possible triplet does not sum up to 0."},
    {"input": "nums = [0,0,0]", "output": "[[0,0,0]]", "explanation": "The only possible triplet sums up to 0."}
  ]'::jsonb,
  ARRAY['3 <= nums.length <= 3000', '-100000 <= nums[i] <= 100000'],
  true,
  '{
    "python3": "class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nvar threeSum = function(nums) {\n    \n};",
    "java": "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        \n    }\n};"
  }'::jsonb,
  'threeSum',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(12, '{"nums": [-1,0,1,2,-1,-4]}', '[[-1,-1,2],[-1,0,1]]', true, 6, 1),
(12, '{"nums": [0,1,1]}', '[]', true, 3, 2),
(12, '{"nums": [0,0,0]}', '[[0,0,0]]', true, 3, 3),
(12, '{"nums": [-2,0,1,1,2]}', '[[-2,0,2],[-2,1,1]]', false, 5, 4),
(12, '{"nums": [-1,0,1,0]}', '[[-1,0,1]]', false, 4, 5),
(12, '{"nums": [1,2,-2,-1]}', '[]', false, 4, 6),
(12, '{"nums": [-4,-2,-2,-2,0,1,2,2,2,3,3,6,6,6,8]}', '[[-4,-2,6],[-4,1,3],[-4,2,2],[-2,0,2]]'::jsonb, false, 15, 7);

-- Large test: array of 1500 elements, many zeros and a few non-zero
-- 750 copies of -1, 750 copies of 1, one 0 => triplets: [[-1,0,1]]
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 12,
       jsonb_build_object('nums', array_agg(v ORDER BY random()))::jsonb,
       '[[-1,0,1]]'::jsonb,
       false,
       1501,
       8
FROM (
  SELECT generate_series(1,750) AS i, -1 AS v
  UNION ALL
  SELECT generate_series(1,750), 1
  UNION ALL
  SELECT 1, 0
) sub;


-- ============================================================================
-- 13. Container With Most Water
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  13,
  'container-with-most-water',
  'Container With Most Water',
  'medium',
  ARRAY['array','two-pointers','greedy'],
  E'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\n**Notice** that you may not slant the container.',
  '[
    {"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49", "explanation": "The vertical lines are represented by [1,8,6,2,5,4,8,3,7]. The max area of water the container can contain is 49 (between index 1 and index 8, min(8,7)*7 = 49)."},
    {"input": "height = [1,1]", "output": "1", "explanation": "The max area is min(1,1) * 1 = 1."}
  ]'::jsonb,
  ARRAY['n == height.length', '2 <= n <= 100000', '0 <= height[i] <= 10000'],
  true,
  '{
    "python3": "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        pass",
    "javascript": "/**\n * @param {number[]} height\n * @return {number}\n */\nvar maxArea = function(height) {\n    \n};",
    "java": "class Solution {\n    public int maxArea(int[] height) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        \n    }\n};"
  }'::jsonb,
  'maxArea',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(13, '{"height": [1,8,6,2,5,4,8,3,7]}', '49', true, 9, 1),
(13, '{"height": [1,1]}', '1', true, 2, 2),
(13, '{"height": [4,3,2,1,4]}', '16', false, 5, 3),
(13, '{"height": [1,2,1]}', '2', false, 3, 4),
(13, '{"height": [2,3,4,5,18,17,6]}', '17', false, 7, 5),
(13, '{"height": [1,2,4,3]}', '4', true, 4, 6),
(13, '{"height": [10000,10000]}', '10000', false, 2, 7);

-- Large test: 2000 heights, a 10000-tall line at index 0 and index 1999 => area = min(10000,10000)*1999 = 19990000
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 13,
       jsonb_build_object('height', (
         SELECT array_agg(CASE WHEN i = 1 OR i = 2000 THEN 10000 ELSE (i % 50) + 1 END ORDER BY i)
         FROM generate_series(1, 2000) AS i
       )),
       '19990000'::jsonb,
       false,
       2000,
       8;


-- ============================================================================
-- 14. Group Anagrams
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  14,
  'group-anagrams',
  'Group Anagrams',
  'medium',
  ARRAY['array','hash-table','string','sorting'],
  E'Given an array of strings `strs`, group the **anagrams** together. You can return the answer in **any order**.\n\nAn **anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.\n\nWithin each group, strings should be in the order they appear in the input. Groups may be returned in any order.',
  '[
    {"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", "explanation": "There are 3 groups of anagrams."},
    {"input": "strs = [\"\"]", "output": "[[\"\"]]", "explanation": "A single empty string forms one group."},
    {"input": "strs = [\"a\"]", "output": "[[\"a\"]]", "explanation": "A single character forms one group."}
  ]'::jsonb,
  ARRAY['1 <= strs.length <= 10000', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
  true,
  '{
    "python3": "class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        pass",
    "javascript": "/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nvar groupAnagrams = function(strs) {\n    \n};",
    "java": "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        \n    }\n};"
  }'::jsonb,
  'groupAnagrams',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(14, '{"strs": ["eat","tea","tan","ate","nat","bat"]}', '[["eat","tea","ate"],["tan","nat"],["bat"]]', true, 6, 1),
(14, '{"strs": [""]}', '[[""]]', true, 1, 2),
(14, '{"strs": ["a"]}', '[["a"]]', true, 1, 3),
(14, '{"strs": ["abc","bca","cab","xyz","zyx","yxz"]}', '[["abc","bca","cab"],["xyz","zyx","yxz"]]', false, 6, 4),
(14, '{"strs": ["","",""]}', '[["","",""]]', false, 3, 5),
(14, '{"strs": ["ab","ba","abc","bca","a","a"]}', '[["ab","ba"],["abc","bca"],["a","a"]]', false, 6, 6),
(14, '{"strs": ["listen","silent","hello","world","enlist"]}', '[["listen","silent","enlist"],["hello"],["world"]]', false, 5, 7);

-- Large test: 1200 strings, 400 copies each of "abc", "bca", "cab"
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 14,
       jsonb_build_object('strs', (
         SELECT array_agg(w ORDER BY i)
         FROM (
           SELECT generate_series(1,400) AS i, 'abc' AS w
           UNION ALL SELECT generate_series(401,800), 'bca'
           UNION ALL SELECT generate_series(801,1200), 'cab'
         ) sub
       )),
       (SELECT jsonb_build_array(
         (SELECT jsonb_agg(w) FROM (SELECT generate_series(1,400), 'abc' AS w UNION ALL SELECT generate_series(401,800), 'bca' UNION ALL SELECT generate_series(801,1200), 'cab') s)
       )),
       false,
       1200,
       8;


-- ============================================================================
-- 15. Product of Array Except Self
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  15,
  'product-of-array-except-self',
  'Product of Array Except Self',
  'medium',
  ARRAY['array','prefix-sum'],
  E'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is **guaranteed** to fit in a **32-bit** integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.',
  '[
    {"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]", "explanation": "Product except self: [2*3*4, 1*3*4, 1*2*4, 1*2*3] = [24,12,8,6]."},
    {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]", "explanation": "Product except self with a zero present."}
  ]'::jsonb,
  ARRAY['2 <= nums.length <= 100000', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'],
  true,
  '{
    "python3": "class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar productExceptSelf = function(nums) {\n    \n};",
    "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};"
  }'::jsonb,
  'productExceptSelf',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(15, '{"nums": [1,2,3,4]}', '[24,12,8,6]', true, 4, 1),
(15, '{"nums": [-1,1,0,-3,3]}', '[0,0,9,0,0]', true, 5, 2),
(15, '{"nums": [2,3]}', '[3,2]', false, 2, 3),
(15, '{"nums": [0,0]}', '[0,0]', false, 2, 4),
(15, '{"nums": [1,1,1,1,1]}', '[1,1,1,1,1]', false, 5, 5),
(15, '{"nums": [-1,-1]}', '[-1,-1]', true, 2, 6),
(15, '{"nums": [5,0,2,3]}', '[0,30,0,0]', false, 4, 7);

-- Large test: 2000 ones => each answer is 1
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 15,
       jsonb_build_object('nums', (SELECT array_agg(1) FROM generate_series(1,2000))),
       (SELECT jsonb_agg(1) FROM generate_series(1,2000)),
       false,
       2000,
       8;


-- ============================================================================
-- 16. Coin Change
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  16,
  'coin-change',
  'Coin Change',
  'medium',
  ARRAY['array','dynamic-programming','breadth-first-search'],
  E'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an infinite number of each kind of coin.',
  '[
    {"input": "coins = [1,5,10,25], amount = 41", "output": "4", "explanation": "25 + 10 + 5 + 1 = 41, using 4 coins."},
    {"input": "coins = [2], amount = 3", "output": "-1", "explanation": "3 cannot be made from coins of denomination 2."},
    {"input": "coins = [1], amount = 0", "output": "0", "explanation": "0 coins are needed for amount 0."}
  ]'::jsonb,
  ARRAY['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10000'],
  true,
  '{
    "python3": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        pass",
    "javascript": "/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nvar coinChange = function(coins, amount) {\n    \n};",
    "java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        \n    }\n};"
  }'::jsonb,
  'coinChange',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(16, '{"coins": [1,5,10,25], "amount": 41}', '4', true, 4, 1),
(16, '{"coins": [2], "amount": 3}', '-1', true, 1, 2),
(16, '{"coins": [1], "amount": 0}', '0', true, 1, 3),
(16, '{"coins": [1], "amount": 1}', '1', false, 1, 4),
(16, '{"coins": [1,3,5], "amount": 11}', '3', false, 3, 5),
(16, '{"coins": [2,5,10,1], "amount": 27}', '4', false, 4, 6),
(16, '{"coins": [1,5,10,25], "amount": 100}', '4', false, 4, 7),
(16, '{"coins": [1,2,5], "amount": 10000}', '2000', false, 3, 8);


-- ============================================================================
-- 17. Validate Binary Search Tree
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  17,
  'validate-binary-search-tree',
  'Validate Binary Search Tree',
  'medium',
  ARRAY['tree','depth-first-search','binary-search-tree','binary-tree'],
  E'Given the `root` of a binary tree, determine if it is a valid **binary search tree (BST)**.\n\nA **valid BST** is defined as follows:\n- The left subtree of a node contains only nodes with keys **less than** the node''s key.\n- The right subtree of a node contains only nodes with keys **greater than** the node''s key.\n- Both the left and right subtrees must also be binary search trees.\n\nThe tree is represented as a level-order array where `null` indicates a missing node. For example, `[2,1,3]` represents:\n```\n    2\n   / \\\n  1   3\n```',
  '[
    {"input": "root = [2,1,3]", "output": "true", "explanation": "The left child 1 < 2 and right child 3 > 2, so it is a valid BST."},
    {"input": "root = [5,1,4,null,null,3,6]", "output": "false", "explanation": "The root is 5 but the right child is 4, which is less than 5."},
    {"input": "root = [1]", "output": "true", "explanation": "A single node is always a valid BST."}
  ]'::jsonb,
  ARRAY['The number of nodes in the tree is in the range [1, 10000].', '-2^31 <= Node.val <= 2^31 - 1'],
  true,
  '{
    "python3": "class Solution:\n    def isValidBST(self, root: list) -> bool:\n        pass",
    "javascript": "/**\n * @param {(number|null)[]} root\n * @return {boolean}\n */\nvar isValidBST = function(root) {\n    \n};",
    "java": "class Solution {\n    public boolean isValidBST(int[] root) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isValidBST(vector<int>& root) {\n        \n    }\n};"
  }'::jsonb,
  'isValidBST',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(17, '{"root": [2,1,3]}', 'true', true, 3, 1),
(17, '{"root": [5,1,4,null,null,3,6]}', 'false', true, 7, 2),
(17, '{"root": [1]}', 'true', true, 1, 3),
(17, '{"root": [2,2,2]}', 'false', false, 3, 4),
(17, '{"root": [5,4,6,null,null,3,7]}', 'false', false, 7, 5),
(17, '{"root": [10,5,15,null,null,6,20]}', 'false', false, 7, 6),
(17, '{"root": [3,1,5,0,2,4,6]}', 'true', false, 7, 7);

-- Large test: a valid BST with 1023 nodes (complete binary tree depth 10, values 1..1023 placed in BST order)
-- We build a perfect BST from sorted array [1..1023].
-- Level-order of a perfect BST from 1..n: root=512, next level 256,768, etc.
-- Easiest: just supply a valid BST array
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
VALUES (
  17,
  (SELECT jsonb_build_object('root',
    jsonb_agg(val ORDER BY pos)
  ) FROM (
    -- Build level-order array for a complete BST with values 1..1023
    -- For a perfect binary tree of height h with 2^h - 1 nodes,
    -- the root is the middle element. We use a recursive CTE.
    WITH RECURSIVE bst_build AS (
      -- (position in level-order array, low, high)
      SELECT 1 AS pos, 1 AS lo, 1023 AS hi, 512 AS val
      UNION ALL
      SELECT
        CASE WHEN is_left THEN 2 * b.pos ELSE 2 * b.pos + 1 END,
        CASE WHEN is_left THEN b.lo ELSE b.val + 1 END,
        CASE WHEN is_left THEN b.val - 1 ELSE b.hi END,
        CASE WHEN is_left THEN b.lo + (b.val - 1 - b.lo) / 2 ELSE (b.val + 1) + (b.hi - b.val - 1) / 2 END
      FROM bst_build b, (VALUES (true), (false)) AS sides(is_left)
      WHERE CASE WHEN is_left THEN b.lo <= b.val - 1 ELSE b.val + 1 <= b.hi END
    )
    SELECT pos, val FROM bst_build
  ) sub),
  'true',
  false,
  1023,
  8
);


-- ============================================================================
-- 18. Sort Colors (Dutch National Flag)
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  18,
  'sort-colors',
  'Sort Colors',
  'medium',
  ARRAY['array','two-pointers','sorting'],
  E'Given an array `nums` with `n` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n\nWe will use the integers `0`, `1`, and `2` to represent the color red, white, and blue, respectively.\n\nYou must solve this problem without using the library''s sort function.\n\n**Follow up:** Could you come up with a one-pass algorithm using only constant extra space?',
  '[
    {"input": "nums = [2,0,2,1,1,0]", "output": "[0,0,1,1,2,2]", "explanation": "After sorting: all 0s, then 1s, then 2s."},
    {"input": "nums = [2,0,1]", "output": "[0,1,2]", "explanation": "Sorted in one pass."}
  ]'::jsonb,
  ARRAY['n == nums.length', '1 <= n <= 300', 'nums[i] is either 0, 1, or 2.'],
  true,
  '{
    "python3": "class Solution:\n    def sortColors(self, nums: list[int]) -> list[int]:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar sortColors = function(nums) {\n    \n};",
    "java": "class Solution {\n    public int[] sortColors(int[] nums) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> sortColors(vector<int>& nums) {\n        \n    }\n};"
  }'::jsonb,
  'sortColors',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(18, '{"nums": [2,0,2,1,1,0]}', '[0,0,1,1,2,2]', true, 6, 1),
(18, '{"nums": [2,0,1]}', '[0,1,2]', true, 3, 2),
(18, '{"nums": [0]}', '[0]', false, 1, 3),
(18, '{"nums": [1]}', '[1]', false, 1, 4),
(18, '{"nums": [0,0,0]}', '[0,0,0]', false, 3, 5),
(18, '{"nums": [2,2,2,1,1,0,0]}', '[0,0,1,1,2,2,2]', true, 7, 6),
(18, '{"nums": [1,0,2,1,0,2,1,0]}', '[0,0,0,1,1,1,2,2]', false, 8, 7);

-- Large test: 1500 elements (500 zeros, 500 ones, 500 twos shuffled)
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 18,
       jsonb_build_object('nums', (
         SELECT array_agg(v ORDER BY random())
         FROM (
           SELECT generate_series(1,500), 0 AS v
           UNION ALL SELECT generate_series(1,500), 1
           UNION ALL SELECT generate_series(1,500), 2
         ) sub
       )),
       (SELECT jsonb_agg(v) FROM (
         SELECT generate_series(1,500), 0 AS v
         UNION ALL SELECT generate_series(1,500), 1
         UNION ALL SELECT generate_series(1,500), 2
       ) sub2),
       false,
       1500,
       8;


-- ============================================================================
-- 19. Subsets
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  19,
  'subsets',
  'Subsets',
  'medium',
  ARRAY['array','backtracking','bit-manipulation'],
  E'Given an integer array `nums` of **unique** elements, return all possible subsets (the power set).\n\nThe solution set **must not** contain duplicate subsets. Return the subsets in any order.\n\nEach individual subset should be sorted in non-decreasing order.',
  '[
    {"input": "nums = [1,2,3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]", "explanation": "All 2^3 = 8 subsets of [1,2,3]."},
    {"input": "nums = [0]", "output": "[[],[0]]", "explanation": "All 2^1 = 2 subsets of [0]."}
  ]'::jsonb,
  ARRAY['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'All the numbers of nums are unique.'],
  true,
  '{
    "python3": "class Solution:\n    def subsets(self, nums: list[int]) -> list[list[int]]:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nvar subsets = function(nums) {\n    \n};",
    "java": "class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        \n    }\n};"
  }'::jsonb,
  'subsets',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(19, '{"nums": [1,2,3]}', '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]', true, 3, 1),
(19, '{"nums": [0]}', '[[],[0]]', true, 1, 2),
(19, '{"nums": [1]}', '[[],[1]]', false, 1, 3),
(19, '{"nums": [1,2]}', '[[],[1],[2],[1,2]]', true, 2, 4),
(19, '{"nums": [-1,0,1]}', '[[],[-1],[0],[-1,0],[1],[-1,1],[0,1],[-1,0,1]]', false, 3, 5),
(19, '{"nums": [5,9]}', '[[],[5],[9],[5,9]]', false, 2, 6),
(19, '{"nums": [3,5,7,9]}', '[[],[3],[5],[3,5],[7],[3,7],[5,7],[3,5,7],[9],[3,9],[5,9],[3,5,9],[7,9],[3,7,9],[5,7,9],[3,5,7,9]]', false, 4, 7);

-- Large test: 10 elements => 1024 subsets
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 19,
       '{"nums": [1,2,3,4,5,6,7,8,9,10]}'::jsonb,
       (SELECT jsonb_agg(subset ORDER BY subset::text) FROM (
         SELECT COALESCE(jsonb_agg(v ORDER BY v), '[]'::jsonb) AS subset
         FROM generate_series(0, 1023) AS mask
         LEFT JOIN LATERAL (
           SELECT unnest AS v
           FROM unnest(ARRAY[1,2,3,4,5,6,7,8,9,10]) WITH ORDINALITY AS t(unnest, ord)
           WHERE (mask >> (ord::int - 1)) & 1 = 1
         ) elems ON true
         GROUP BY mask
       ) subsets),
       false,
       1024,
       8;


-- ============================================================================
-- 20. Decode Ways
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  20,
  'decode-ways',
  'Decode Ways',
  'medium',
  ARRAY['string','dynamic-programming'],
  E'A message containing letters from `A-Z` can be **encoded** into numbers using the following mapping:\n\n```\n''A'' -> "1"\n''B'' -> "2"\n...\n''Z'' -> "26"\n```\n\nTo **decode** an encoded message, all the digits must be grouped then mapped back into letters using the reverse of the mapping above (there may be multiple ways). For example, `"11106"` can be mapped into:\n- `"AAJF"` with the grouping `(1 1 10 6)`\n- `"KJF"` with the grouping `(11 10 6)`\n\nNote that the grouping `(1 11 06)` is invalid because `"06"` cannot be mapped into `''F''` since `"6"` is different from `"06"`.\n\nGiven a string `s` containing only digits, return the **number of ways** to decode it.\n\nThe test cases are generated so that the answer fits in a **32-bit** integer.',
  '[
    {"input": "s = \"12\"", "output": "2", "explanation": "\"12\" could be decoded as \"AB\" (1 2) or \"L\" (12)."},
    {"input": "s = \"226\"", "output": "3", "explanation": "\"226\" could be decoded as \"BZ\" (2 26), \"VF\" (22 6), or \"BBF\" (2 2 6)."},
    {"input": "s = \"06\"", "output": "0", "explanation": "\"06\" cannot be mapped to \"F\" because of the leading zero. There is no valid decoding."}
  ]'::jsonb,
  ARRAY['1 <= s.length <= 100', 's contains only digits and may contain leading zeros.'],
  true,
  '{
    "python3": "class Solution:\n    def numDecodings(self, s: str) -> int:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nvar numDecodings = function(s) {\n    \n};",
    "java": "class Solution {\n    public int numDecodings(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int numDecodings(string s) {\n        \n    }\n};"
  }'::jsonb,
  'numDecodings',
  7
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(20, '{"s": "12"}', '2', true, 2, 1),
(20, '{"s": "226"}', '3', true, 3, 2),
(20, '{"s": "06"}', '0', true, 2, 3),
(20, '{"s": "0"}', '0', false, 1, 4),
(20, '{"s": "10"}', '1', false, 2, 5),
(20, '{"s": "27"}', '1', false, 2, 6),
(20, '{"s": "2101"}', '1', false, 4, 7),
-- Large test: "1" repeated 100 times. Fibonacci-like: ways("1"*n) = fib(n+1).
-- "1" * 100 => 573147844013817084101 ways -- too large for 32-bit.
-- Use "1" repeated 45 times => fib(46) = 1836311903 (fits 32-bit)
(20, '{"s": "111111111111111111111111111111111111111111111"}', '1836311903', false, 45, 8);


-- ── Reset sequences so future serial inserts don't collide ──────────────────
SELECT setval('problems_id_seq', (SELECT MAX(id) FROM problems));
SELECT setval('test_cases_id_seq', (SELECT MAX(id) FROM test_cases));
