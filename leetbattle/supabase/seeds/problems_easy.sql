-- ============================================================
-- LeetBattle: EASY problems seed data
-- 10 problems + 6-8 test cases each
-- ============================================================

-- ============================================================
-- 1. Two Sum
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  1,
  'two-sum',
  'Two Sum',
  'easy',
  ARRAY['array', 'hash-table'],
  E'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
  '[
    {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
    {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."},
    {"input": "nums = [3,3], target = 6", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 6, we return [0, 1]."}
  ]'::jsonb,
  ARRAY[
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    'Only one valid answer exists.'
  ],
  true,
  '{
    "python3": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
  }'::jsonb,
  'twoSum',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (1, '{"nums": [2, 7, 11, 15], "target": 9}', '[0, 1]', true, 4, 1),
  (1, '{"nums": [3, 2, 4], "target": 6}', '[1, 2]', true, 3, 2),
  (1, '{"nums": [3, 3], "target": 6}', '[0, 1]', true, 2, 3),
  (1, '{"nums": [1, 5, 8, 3, 9], "target": 12}', '[1, 3]', false, 5, 4),
  (1, '{"nums": [-1, -2, -3, -4, -5], "target": -8}', '[2, 4]', false, 5, 5),
  (1, '{"nums": [0, 4, 3, 0], "target": 0}', '[0, 3]', false, 4, 6),
  (1, '{"nums": [1000000, -1000000, 3, 7], "target": 0}', '[0, 1]', false, 4, 7);

-- Large input test case for Two Sum (input_size > 1000)
-- Array of 1..2000, target = 3999 => indices [1998, 1999] (values 1999 + 2000 = 3999)
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  1,
  jsonb_build_object(
    'nums', (SELECT jsonb_agg(i) FROM generate_series(1, 2000) AS i),
    'target', 3999
  ),
  '[1998, 1999]'::jsonb,
  false,
  2000,
  8;


-- ============================================================
-- 2. Valid Parentheses
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  2,
  'valid-parentheses',
  'Valid Parentheses',
  'easy',
  ARRAY['string', 'stack'],
  E'Given a string `s` containing just the characters `''('', '')'', ''{'', ''}'', ''[''` and `'']''`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
  '[
    {"input": "s = \"()\"", "output": "true", "explanation": "Single pair of matching parentheses."},
    {"input": "s = \"()[]{}\"", "output": "true", "explanation": "All bracket types are correctly matched."},
    {"input": "s = \"(]\"", "output": "false", "explanation": "The brackets do not match."}
  ]'::jsonb,
  ARRAY[
    '1 <= s.length <= 10^4',
    's consists of parentheses only ''()[]{}''.'
  ],
  true,
  '{
    "python3": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};",
    "java": "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};"
  }'::jsonb,
  'isValid',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (2, '{"s": "()"}', 'true', true, 2, 1),
  (2, '{"s": "()[]{}"}', 'true', true, 6, 2),
  (2, '{"s": "(]"}', 'false', true, 2, 3),
  (2, '{"s": "([)]"}', 'false', false, 4, 4),
  (2, '{"s": "{[]}"}', 'true', false, 4, 5),
  (2, '{"s": "]"}', 'false', false, 1, 6),
  (2, '{"s": "(((())))"}', 'true', false, 8, 7);

-- Large input: 2000 nested parentheses => valid
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  2,
  jsonb_build_object('s', repeat('(', 1000) || repeat(')', 1000)),
  'true'::jsonb,
  false,
  2000,
  8;


-- ============================================================
-- 3. Merge Two Sorted Lists (array-based)
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  3,
  'merge-two-sorted-lists',
  'Merge Two Sorted Lists',
  'easy',
  ARRAY['array', 'two-pointers', 'sorting'],
  E'You are given two integer arrays `list1` and `list2`, both sorted in **non-decreasing** order.\n\nMerge the two arrays into one sorted array in **non-decreasing** order and return it.\n\nThe result array should be made by splicing together the values from the two input arrays.',
  '[
    {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]", "explanation": "Merging [1,2,4] and [1,3,4] gives [1,1,2,3,4,4]."},
    {"input": "list1 = [], list2 = []", "output": "[]", "explanation": "Both lists are empty."},
    {"input": "list1 = [], list2 = [0]", "output": "[0]", "explanation": "One list is empty, so the result is the other list."}
  ]'::jsonb,
  ARRAY[
    '0 <= list1.length, list2.length <= 50',
    '-100 <= list1[i], list2[i] <= 100',
    'Both list1 and list2 are sorted in non-decreasing order.'
  ],
  true,
  '{
    "python3": "class Solution:\n    def mergeTwoLists(self, list1: list[int], list2: list[int]) -> list[int]:\n        pass",
    "javascript": "/**\n * @param {number[]} list1\n * @param {number[]} list2\n * @return {number[]}\n */\nvar mergeTwoLists = function(list1, list2) {\n    \n};",
    "java": "class Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {\n        \n    }\n};"
  }'::jsonb,
  'mergeTwoLists',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (3, '{"list1": [1, 2, 4], "list2": [1, 3, 4]}', '[1, 1, 2, 3, 4, 4]', true, 6, 1),
  (3, '{"list1": [], "list2": []}', '[]', true, 0, 2),
  (3, '{"list1": [], "list2": [0]}', '[0]', true, 1, 3),
  (3, '{"list1": [5], "list2": [1, 2, 3, 4]}', '[1, 2, 3, 4, 5]', false, 5, 4),
  (3, '{"list1": [-10, -5, 0], "list2": [-7, -3, 1]}', '[-10, -7, -5, -3, 0, 1]', false, 6, 5),
  (3, '{"list1": [1, 1, 1], "list2": [1, 1, 1]}', '[1, 1, 1, 1, 1, 1]', false, 6, 6),
  (3, '{"list1": [2, 4, 6, 8, 10], "list2": [1, 3, 5, 7, 9]}', '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', false, 10, 7);

-- Large input: two sorted arrays of 1000 elements each
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  3,
  jsonb_build_object(
    'list1', (SELECT jsonb_agg(i) FROM generate_series(1, 2000, 2) AS i),
    'list2', (SELECT jsonb_agg(i) FROM generate_series(2, 2000, 2) AS i)
  ),
  (SELECT jsonb_agg(i) FROM generate_series(1, 2000) AS i),
  false,
  2000,
  8;


-- ============================================================
-- 4. Best Time to Buy and Sell Stock
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  4,
  'best-time-to-buy-and-sell-stock',
  'Best Time to Buy and Sell Stock',
  'easy',
  ARRAY['array', 'dynamic-programming'],
  E'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day.\n\nYou want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.',
  '[
    {"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."},
    {"input": "prices = [7,6,4,3,1]", "output": "0", "explanation": "No profitable transaction is possible, so max profit = 0."}
  ]'::jsonb,
  ARRAY[
    '1 <= prices.length <= 10^5',
    '0 <= prices[i] <= 10^4'
  ],
  true,
  '{
    "python3": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass",
    "javascript": "/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    \n};",
    "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};"
  }'::jsonb,
  'maxProfit',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (4, '{"prices": [7, 1, 5, 3, 6, 4]}', '5', true, 6, 1),
  (4, '{"prices": [7, 6, 4, 3, 1]}', '0', true, 5, 2),
  (4, '{"prices": [2, 4, 1]}', '2', true, 3, 3),
  (4, '{"prices": [1]}', '0', false, 1, 4),
  (4, '{"prices": [1, 2]}', '1', false, 2, 5),
  (4, '{"prices": [2, 1]}', '0', false, 2, 6),
  (4, '{"prices": [3, 3, 3, 3, 3]}', '0', false, 5, 7);

-- Large input: prices descending from 5000 then ascending to 10000 => profit = 9999
-- [5000, 4999, ..., 1, 2, 3, ..., 10000]
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  4,
  jsonb_build_object(
    'prices',
    (
      SELECT jsonb_agg(v ORDER BY rn)
      FROM (
        SELECT i AS v, row_number() OVER () AS rn
        FROM generate_series(5000, 1, -1) AS i
        UNION ALL
        SELECT i AS v, 5000 + row_number() OVER () AS rn
        FROM generate_series(2, 10000) AS i
      ) sub
    )
  ),
  '9999'::jsonb,
  false,
  14999,
  8;


-- ============================================================
-- 5. Valid Palindrome
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  5,
  'valid-palindrome',
  'Valid Palindrome',
  'easy',
  ARRAY['string', 'two-pointers'],
  E'A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
  '[
    {"input": "s = \"A man, a plan, a canal: Panama\"", "output": "true", "explanation": "\"amanaplanacanalpanama\" is a palindrome."},
    {"input": "s = \"race a car\"", "output": "false", "explanation": "\"raceacar\" is not a palindrome."},
    {"input": "s = \" \"", "output": "true", "explanation": "After removing non-alphanumeric characters, s is an empty string. An empty string is a palindrome by definition."}
  ]'::jsonb,
  ARRAY[
    '1 <= s.length <= 2 * 10^5',
    's consists only of printable ASCII characters.'
  ],
  true,
  '{
    "python3": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isPalindrome = function(s) {\n    \n};",
    "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        \n    }\n};"
  }'::jsonb,
  'isPalindrome',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (5, '{"s": "A man, a plan, a canal: Panama"}', 'true', true, 30, 1),
  (5, '{"s": "race a car"}', 'false', true, 10, 2),
  (5, '{"s": " "}', 'true', true, 1, 3),
  (5, '{"s": "0P"}', 'false', false, 2, 4),
  (5, '{"s": ".,"}', 'true', false, 2, 5),
  (5, '{"s": "aa"}', 'true', false, 2, 6),
  (5, '{"s": "Was it a car or a cat I saw?"}', 'true', false, 30, 7);

-- Large input: 2000-char palindrome
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  5,
  jsonb_build_object('s',
    (SELECT string_agg(chr(97 + (i % 26)), '' ORDER BY i)
     FROM generate_series(1, 1000) AS i)
    ||
    (SELECT string_agg(chr(97 + (i % 26)), '' ORDER BY i DESC)
     FROM generate_series(1, 1000) AS i)
  ),
  'true'::jsonb,
  false,
  2000,
  8;


-- ============================================================
-- 6. Reverse String
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  6,
  'reverse-string',
  'Reverse String',
  'easy',
  ARRAY['string', 'two-pointers'],
  E'Write a function that reverses a string. The input is given as an array of characters `s`.\n\nYou must do this by modifying the input array **in-place** with O(1) extra memory.\n\nReturn the reversed array.',
  '[
    {"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]", "explanation": "The array is reversed in-place."},
    {"input": "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "output": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", "explanation": "The array is reversed in-place."}
  ]'::jsonb,
  ARRAY[
    '1 <= s.length <= 10^5',
    's[i] is a printable ASCII character.'
  ],
  true,
  '{
    "python3": "class Solution:\n    def reverseString(self, s: list[str]) -> list[str]:\n        pass",
    "javascript": "/**\n * @param {character[]} s\n * @return {character[]}\n */\nvar reverseString = function(s) {\n    \n};",
    "java": "class Solution {\n    public char[] reverseString(char[] s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<char> reverseString(vector<char>& s) {\n        \n    }\n};"
  }'::jsonb,
  'reverseString',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (6, '{"s": ["h","e","l","l","o"]}', '["o","l","l","e","h"]', true, 5, 1),
  (6, '{"s": ["H","a","n","n","a","h"]}', '["h","a","n","n","a","H"]', true, 6, 2),
  (6, '{"s": ["A"]}', '["A"]', true, 1, 3),
  (6, '{"s": ["a","b"]}', '["b","a"]', false, 2, 4),
  (6, '{"s": ["a","b","c","d","e","f"]}', '["f","e","d","c","b","a"]', false, 6, 5),
  (6, '{"s": ["x","x","x"]}', '["x","x","x"]', false, 3, 6),
  (6, '{"s": ["Z","a","Z"]}', '["Z","a","Z"]', false, 3, 7);

-- Large input: 2000-char array
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  6,
  jsonb_build_object('s',
    (SELECT jsonb_agg(chr(97 + (i % 26))) FROM generate_series(1, 2000) AS i)
  ),
  (SELECT jsonb_agg(chr(97 + (i % 26))) FROM generate_series(2000, 1, -1) AS i),
  false,
  2000,
  8;


-- ============================================================
-- 7. Maximum Subarray
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  7,
  'maximum-subarray',
  'Maximum Subarray',
  'easy',
  ARRAY['array', 'dynamic-programming', 'divide-and-conquer'],
  E'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA **subarray** is a contiguous non-empty sequence of elements within an array.',
  '[
    {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "The subarray [4,-1,2,1] has the largest sum 6."},
    {"input": "nums = [1]", "output": "1", "explanation": "The subarray [1] has the largest sum 1."},
    {"input": "nums = [5,4,-1,7,8]", "output": "23", "explanation": "The subarray [5,4,-1,7,8] has the largest sum 23."}
  ]'::jsonb,
  ARRAY[
    '1 <= nums.length <= 10^5',
    '-10^4 <= nums[i] <= 10^4'
  ],
  true,
  '{
    "python3": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    \n};",
    "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};"
  }'::jsonb,
  'maxSubArray',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (7, '{"nums": [-2, 1, -3, 4, -1, 2, 1, -5, 4]}', '6', true, 9, 1),
  (7, '{"nums": [1]}', '1', true, 1, 2),
  (7, '{"nums": [5, 4, -1, 7, 8]}', '23', true, 5, 3),
  (7, '{"nums": [-1]}', '-1', false, 1, 4),
  (7, '{"nums": [-2, -1]}', '-1', false, 2, 5),
  (7, '{"nums": [1, 2, 3, 4, 5]}', '15', false, 5, 6),
  (7, '{"nums": [-1, 0, -2]}', '0', false, 3, 7);

-- Large input: array of 2000 elements alternating 1 and -1, with a block of 100 positive numbers
-- [1, -1, 1, -1, ... (900 pairs), 5, 5, 5, ... (100 fives), 1, -1, ... (100 pairs)]
-- Max subarray sum = 500 (the block of 100 fives)
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  7,
  jsonb_build_object('nums',
    (
      SELECT jsonb_agg(v ORDER BY rn)
      FROM (
        SELECT CASE WHEN i % 2 = 1 THEN 1 ELSE -1 END AS v, i AS rn
        FROM generate_series(1, 1800) AS i
        UNION ALL
        SELECT 5 AS v, 1800 + i AS rn
        FROM generate_series(1, 100) AS i
        UNION ALL
        SELECT CASE WHEN i % 2 = 1 THEN 1 ELSE -1 END AS v, 1900 + i AS rn
        FROM generate_series(1, 100) AS i
      ) sub
    )
  ),
  '500'::jsonb,
  false,
  2000,
  8;


-- ============================================================
-- 8. Contains Duplicate
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  8,
  'contains-duplicate',
  'Contains Duplicate',
  'easy',
  ARRAY['array', 'hash-table', 'sorting'],
  E'Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.',
  '[
    {"input": "nums = [1,2,3,1]", "output": "true", "explanation": "The element 1 occurs at indices 0 and 3."},
    {"input": "nums = [1,2,3,4]", "output": "false", "explanation": "All elements are distinct."},
    {"input": "nums = [1,1,1,3,3,4,3,2,4,2]", "output": "true", "explanation": "Multiple elements have duplicates."}
  ]'::jsonb,
  ARRAY[
    '1 <= nums.length <= 10^5',
    '-10^9 <= nums[i] <= 10^9'
  ],
  true,
  '{
    "python3": "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass",
    "javascript": "/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar containsDuplicate = function(nums) {\n    \n};",
    "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};"
  }'::jsonb,
  'containsDuplicate',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (8, '{"nums": [1, 2, 3, 1]}', 'true', true, 4, 1),
  (8, '{"nums": [1, 2, 3, 4]}', 'false', true, 4, 2),
  (8, '{"nums": [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]}', 'true', true, 10, 3),
  (8, '{"nums": [1]}', 'false', false, 1, 4),
  (8, '{"nums": [0, 0]}', 'true', false, 2, 5),
  (8, '{"nums": [-1, -1, 2, 3]}', 'true', false, 4, 6),
  (8, '{"nums": [1000000000, -1000000000]}', 'false', false, 2, 7);

-- Large input: 2001 distinct values plus one duplicate at the end
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT
  8,
  jsonb_build_object('nums',
    (
      SELECT jsonb_agg(v ORDER BY rn)
      FROM (
        SELECT i AS v, i AS rn FROM generate_series(1, 2000) AS i
        UNION ALL
        SELECT 1 AS v, 2001 AS rn
      ) sub
    )
  ),
  'true'::jsonb,
  false,
  2001,
  8;


-- ============================================================
-- 9. Climbing Stairs
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  9,
  'climbing-stairs',
  'Climbing Stairs',
  'easy',
  ARRAY['math', 'dynamic-programming', 'memoization'],
  E'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?',
  '[
    {"input": "n = 2", "output": "2", "explanation": "There are two ways: 1+1 and 2."},
    {"input": "n = 3", "output": "3", "explanation": "There are three ways: 1+1+1, 1+2, and 2+1."}
  ]'::jsonb,
  ARRAY[
    '1 <= n <= 45'
  ],
  true,
  '{
    "python3": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass",
    "javascript": "/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    \n};",
    "java": "class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};"
  }'::jsonb,
  'climbStairs',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (9, '{"n": 2}', '2', true, 1, 1),
  (9, '{"n": 3}', '3', true, 1, 2),
  (9, '{"n": 1}', '1', true, 1, 3),
  (9, '{"n": 4}', '5', false, 1, 4),
  (9, '{"n": 5}', '8', false, 1, 5),
  (9, '{"n": 10}', '89', false, 1, 6),
  (9, '{"n": 20}', '10946', false, 1, 7),
  (9, '{"n": 45}', '1836311903', false, 1, 8);


-- ============================================================
-- 10. Roman to Integer
-- ============================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  10,
  'roman-to-integer',
  'Roman to Integer',
  'easy',
  ARRAY['hash-table', 'math', 'string'],
  E'Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.\n\n| Symbol | Value |\n|--------|-------|\n| I      | 1     |\n| V      | 5     |\n| X      | 10    |\n| L      | 50    |\n| C      | 100   |\n| D      | 500   |\n| M      | 1000  |\n\nFor example, `2` is written as `II` in Roman numeral, just two ones added together. `12` is written as `XII`, which is simply `X + II`. The number `27` is written as `XXVII`, which is `XX + V + II`.\n\nRoman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`. There are six instances where subtraction is used:\n\n- `I` can be placed before `V` (5) and `X` (10) to make 4 and 9.\n- `X` can be placed before `L` (50) and `C` (100) to make 40 and 90.\n- `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.\n\nGiven a roman numeral, convert it to an integer.',
  '[
    {"input": "s = \"III\"", "output": "3", "explanation": "III = 3."},
    {"input": "s = \"LVIII\"", "output": "58", "explanation": "L = 50, V = 5, III = 3."},
    {"input": "s = \"MCMXCIV\"", "output": "1994", "explanation": "M = 1000, CM = 900, XC = 90 and IV = 4."}
  ]'::jsonb,
  ARRAY[
    '1 <= s.length <= 15',
    's contains only the characters (''I'', ''V'', ''X'', ''L'', ''C'', ''D'', ''M'').',
    'It is guaranteed that s is a valid roman numeral in the range [1, 3999].'
  ],
  true,
  '{
    "python3": "class Solution:\n    def romanToInt(self, s: str) -> int:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nvar romanToInt = function(s) {\n    \n};",
    "java": "class Solution {\n    public int romanToInt(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int romanToInt(string s) {\n        \n    }\n};"
  }'::jsonb,
  'romanToInt',
  5
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
  (10, '{"s": "III"}', '3', true, 3, 1),
  (10, '{"s": "LVIII"}', '58', true, 5, 2),
  (10, '{"s": "MCMXCIV"}', '1994', true, 7, 3),
  (10, '{"s": "IV"}', '4', false, 2, 4),
  (10, '{"s": "IX"}', '9', false, 2, 5),
  (10, '{"s": "XL"}', '40', false, 2, 6),
  (10, '{"s": "MMMCMXCIX"}', '3999', false, 9, 7),
  (10, '{"s": "DCCCXLIX"}', '849', false, 8, 8);

-- Note: Roman to Integer has a max input length of 15 characters (the constraint),
-- so there is no meaningful "large input" in the traditional sense. The largest valid
-- roman numeral is MMMCMXCIX (3999) which is only 9 characters. The test case for
-- MMMCMXCIX above serves as the boundary/max test.
