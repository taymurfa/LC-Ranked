-- ─────────────────────────────────────────────────────────────────────────────
-- LeetBattle — seed: 10 HARD problems (IDs 21–30) + test cases
-- ─────────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- 21. Trapping Rain Water
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  21,
  'trapping-rain-water',
  'Trapping Rain Water',
  'hard',
  ARRAY['array', 'two-pointers', 'dynamic-programming', 'stack'],
  E'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nEach element of the array represents the height of a bar. Water is trapped between bars when shorter bars are flanked by taller bars on both sides.',
  '[
    {"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6", "explanation": "The elevation map [0,1,0,2,1,0,1,3,2,1,2,1] can trap 6 units of rain water."},
    {"input": "height = [4,2,0,3,2,5]", "output": "9", "explanation": "The elevation map [4,2,0,3,2,5] can trap 9 units of rain water."}
  ]'::jsonb,
  ARRAY['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
  true,
  '{
    "python3": "class Solution:\n    def trap(self, height: list[int]) -> int:\n        pass",
    "javascript": "/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n\n}",
    "java": "class Solution {\n    public int trap(int[] height) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n\n    }\n};"
  }'::jsonb,
  'trap',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(21, '{"height": [0,1,0,2,1,0,1,3,2,1,2,1]}', '6', true, 12, 1),
(21, '{"height": [4,2,0,3,2,5]}', '9', true, 6, 2),
(21, '{"height": [0]}', '0', false, 1, 3),
(21, '{"height": [3,0,3]}', '3', false, 3, 4),
(21, '{"height": [5,4,3,2,1]}', '0', false, 5, 5),
(21, '{"height": [1,2,3,4,5]}', '0', false, 5, 6),
(21, '{"height": [0,7,1,4,6]}', '7', false, 5, 7);

-- Large test case for problem 21 (zigzag pattern of 2000 elements)
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 21,
  jsonb_build_object('height',
    (SELECT jsonb_agg(
      CASE WHEN i % 2 = 0 THEN 10 ELSE 0 END
    ) FROM generate_series(0, 1999) AS i)
  ),
  '9990'::jsonb,
  false,
  2000,
  8;

-- ============================================================================
-- 22. Merge K Sorted Lists (array-based)
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  22,
  'merge-k-sorted-lists',
  'Merge K Sorted Lists',
  'hard',
  ARRAY['array', 'heap', 'divide-and-conquer', 'sorting'],
  E'You are given an array of k sorted arrays. Merge all the sorted arrays into one sorted array and return it.\n\nEach inner array is sorted in ascending order.',
  '[
    {"input": "lists = [[1,4,5],[1,3,4],[2,6]]", "output": "[1,1,2,3,4,4,5,6]", "explanation": "Merging [1,4,5], [1,3,4], and [2,6] produces [1,1,2,3,4,4,5,6]."},
    {"input": "lists = []", "output": "[]", "explanation": "No lists to merge."},
    {"input": "lists = [[]]", "output": "[]", "explanation": "Single empty list returns empty."}
  ]'::jsonb,
  ARRAY['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500', '-10^4 <= lists[i][j] <= 10^4', 'lists[i] is sorted in ascending order', 'The total number of elements across all lists does not exceed 10^4'],
  true,
  '{
    "python3": "class Solution:\n    def mergeKLists(self, lists: list[list[int]]) -> list[int]:\n        pass",
    "javascript": "/**\n * @param {number[][]} lists\n * @return {number[]}\n */\nfunction mergeKLists(lists) {\n\n}",
    "java": "class Solution {\n    public int[] mergeKLists(int[][] lists) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> mergeKLists(vector<vector<int>>& lists) {\n\n    }\n};"
  }'::jsonb,
  'mergeKLists',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(22, '{"lists": [[1,4,5],[1,3,4],[2,6]]}', '[1,1,2,3,4,4,5,6]', true, 8, 1),
(22, '{"lists": []}', '[]', true, 0, 2),
(22, '{"lists": [[]]}', '[]', true, 0, 3),
(22, '{"lists": [[1],[2],[3]]}', '[1,2,3]', false, 3, 4),
(22, '{"lists": [[-5,-3,0],[1,2,7],[-2,4]]}', '[-5,-3,-2,0,1,2,4,7]', false, 8, 5),
(22, '{"lists": [[1,1,1],[1,1,1]]}', '[1,1,1,1,1,1]', false, 6, 6),
(22, '{"lists": [[-10,10],[-5,5],[0]]}', '[-10,-5,0,5,10]', false, 5, 7);

-- Large test case for problem 22 (100 lists, each with ~15 sorted elements)
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 22,
  jsonb_build_object('lists',
    (SELECT jsonb_agg(inner_list)
     FROM (
       SELECT (SELECT jsonb_agg(val ORDER BY val)
               FROM (SELECT (k * 15 + j) AS val
                     FROM generate_series(0, 14) AS j) sub) AS inner_list
       FROM generate_series(0, 99) AS k
     ) sub2)
  ),
  (SELECT jsonb_agg(v ORDER BY v)
   FROM (SELECT (k * 15 + j) AS v
         FROM generate_series(0, 99) AS k,
              generate_series(0, 14) AS j) sub3),
  false,
  1500,
  8;

-- ============================================================================
-- 23. Minimum Window Substring
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  23,
  'minimum-window-substring',
  'Minimum Window Substring',
  'hard',
  ARRAY['string', 'hash-table', 'sliding-window'],
  E'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".\n\nA substring is a contiguous sequence of characters within the string.\n\nThe answer is guaranteed to be unique when it exists.',
  '[
    {"input": "s = \"ADOBECODEBANC\", t = \"ABC\"", "output": "\"BANC\"", "explanation": "The minimum window substring \"BANC\" includes A, B, and C from string t."},
    {"input": "s = \"a\", t = \"a\"", "output": "\"a\"", "explanation": "The entire string s is the minimum window."},
    {"input": "s = \"a\", t = \"aa\"", "output": "\"\"", "explanation": "Both ''a''s from t must be included in the window. Since s only has one ''a'', return empty string."}
  ]'::jsonb,
  ARRAY['m == s.length', 'n == t.length', '1 <= m, n <= 10^5', 's and t consist of uppercase and lowercase English letters'],
  true,
  '{
    "python3": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @param {string} t\n * @return {string}\n */\nfunction minWindow(s, t) {\n\n}",
    "java": "class Solution {\n    public String minWindow(String s, String t) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n\n    }\n};"
  }'::jsonb,
  'minWindow',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(23, '{"s": "ADOBECODEBANC", "t": "ABC"}', '"BANC"', true, 13, 1),
(23, '{"s": "a", "t": "a"}', '"a"', true, 1, 2),
(23, '{"s": "a", "t": "aa"}', '""', true, 1, 3),
(23, '{"s": "ab", "t": "b"}', '"b"', false, 2, 4),
(23, '{"s": "abc", "t": "cba"}', '"abc"', false, 3, 5),
(23, '{"s": "cabwefgewcwaefgcf", "t": "cae"}', '"cwae"', false, 17, 6),
(23, '{"s": "aaaaaaaaab", "t": "ab"}', '"ab"', false, 10, 7);

-- Large test case for problem 23
-- s = 2000 copies of "ABCDEFGHIJ", t = "AJ"
-- The minimum window is "JA" (last char of one cycle, first of next) = length 2
-- Actually within each block ABCDEFGHIJ, the window A...J has length 10.
-- But between blocks: ...JABCDEFGHIJ... the substring "JA" at boundary has length 2.
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
VALUES (23,
  jsonb_build_object('s', repeat('ABCDEFGHIJ', 200), 't', 'AJ'),
  '"JA"',
  false,
  2000,
  8);

-- ============================================================================
-- 24. Longest Valid Parentheses
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  24,
  'longest-valid-parentheses',
  'Longest Valid Parentheses',
  'hard',
  ARRAY['string', 'dynamic-programming', 'stack'],
  E'Given a string containing just the characters ''('' and '')'', return the length of the longest valid (well-formed) parentheses substring.\n\nA valid parentheses string is one where every opening parenthesis has a corresponding closing parenthesis in the correct order.',
  '[
    {"input": "s = \"(()\"", "output": "2", "explanation": "The longest valid parentheses substring is \"()\"."},
    {"input": "s = \")()())\"", "output": "4", "explanation": "The longest valid parentheses substring is \"()()\"."},
    {"input": "s = \"\"", "output": "0", "explanation": "Empty string has no valid parentheses."}
  ]'::jsonb,
  ARRAY['0 <= s.length <= 3 * 10^4', 's[i] is ''('' or '')'''],
  true,
  '{
    "python3": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nfunction longestValidParentheses(s) {\n\n}",
    "java": "class Solution {\n    public int longestValidParentheses(String s) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    int longestValidParentheses(string s) {\n\n    }\n};"
  }'::jsonb,
  'longestValidParentheses',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(24, '{"s": "(()"}', '2', true, 3, 1),
(24, '{"s": ")()())"}', '4', true, 6, 2),
(24, '{"s": ""}', '0', true, 0, 3),
(24, '{"s": "()()"}', '4', false, 4, 4),
(24, '{"s": "((()))"}', '6', false, 6, 5),
(24, '{"s": "()(()"}', '2', false, 5, 6),
(24, '{"s": ")()()("}', '4', false, 6, 7);

-- Large test case for problem 24: 2000 matched parens = "((((...))))..." pattern
-- 1000 open + 1000 close = longest valid is 2000
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
VALUES (24,
  jsonb_build_object('s', repeat('(', 1000) || repeat(')', 1000)),
  '2000',
  false,
  2000,
  8);

-- ============================================================================
-- 25. N-Queens (return count)
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  25,
  'n-queens',
  'N-Queens',
  'hard',
  ARRAY['backtracking', 'recursion'],
  E'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return the number of distinct solutions to the n-queens puzzle.\n\nA queen can attack another queen if they share the same row, column, or diagonal.',
  '[
    {"input": "n = 4", "output": "2", "explanation": "There are two distinct solutions to the 4-queens puzzle."},
    {"input": "n = 1", "output": "1", "explanation": "There is one solution: the single queen on the only square."}
  ]'::jsonb,
  ARRAY['1 <= n <= 9'],
  true,
  '{
    "python3": "class Solution:\n    def totalNQueens(self, n: int) -> int:\n        pass",
    "javascript": "/**\n * @param {number} n\n * @return {number}\n */\nfunction totalNQueens(n) {\n\n}",
    "java": "class Solution {\n    public int totalNQueens(int n) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    int totalNQueens(int n) {\n\n    }\n};"
  }'::jsonb,
  'totalNQueens',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(25, '{"n": 4}', '2', true, 4, 1),
(25, '{"n": 1}', '1', true, 1, 2),
(25, '{"n": 2}', '0', false, 2, 3),
(25, '{"n": 3}', '0', false, 3, 4),
(25, '{"n": 5}', '10', false, 5, 5),
(25, '{"n": 6}', '4', false, 6, 6),
(25, '{"n": 7}', '40', false, 7, 7),
(25, '{"n": 8}', '92', false, 8, 8),
(25, '{"n": 9}', '352', false, 9, 9);

-- ============================================================================
-- 26. Largest Rectangle in Histogram
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  26,
  'largest-rectangle-in-histogram',
  'Largest Rectangle in Histogram',
  'hard',
  ARRAY['array', 'stack', 'monotonic-stack'],
  E'Given an array of integers heights representing the histogram''s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.\n\nThe rectangle must be formed by contiguous bars.',
  '[
    {"input": "heights = [2,1,5,6,2,3]", "output": "10", "explanation": "The largest rectangle has area = 10 units (bars at index 2 and 3 with height 5, width 2 = 10)."},
    {"input": "heights = [2,4]", "output": "4", "explanation": "The largest rectangle has area = 4 (the single bar of height 4)."}
  ]'::jsonb,
  ARRAY['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
  true,
  '{
    "python3": "class Solution:\n    def largestRectangleArea(self, heights: list[int]) -> int:\n        pass",
    "javascript": "/**\n * @param {number[]} heights\n * @return {number}\n */\nfunction largestRectangleArea(heights) {\n\n}",
    "java": "class Solution {\n    public int largestRectangleArea(int[] heights) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n\n    }\n};"
  }'::jsonb,
  'largestRectangleArea',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(26, '{"heights": [2,1,5,6,2,3]}', '10', true, 6, 1),
(26, '{"heights": [2,4]}', '4', true, 4, 2),
(26, '{"heights": [1]}', '1', false, 1, 3),
(26, '{"heights": [5,5,5,5,5]}', '25', false, 5, 4),
(26, '{"heights": [1,2,3,4,5]}', '9', false, 5, 5),
(26, '{"heights": [5,4,3,2,1]}', '9', false, 5, 6),
(26, '{"heights": [0,0,0]}', '0', false, 3, 7);

-- Large test case for problem 26: all bars height 1, length 2000 => area = 2000
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 26,
  jsonb_build_object('heights',
    (SELECT jsonb_agg(1) FROM generate_series(1, 2000))
  ),
  '2000'::jsonb,
  false,
  2000,
  8;

-- ============================================================================
-- 27. Word Break II
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  27,
  'word-break-ii',
  'Word Break II',
  'hard',
  ARRAY['string', 'dynamic-programming', 'backtracking', 'trie', 'memoization'],
  E'Given a string s and a dictionary of strings wordDict, add spaces in s to construct a sentence where each word is a valid dictionary word. Return all such possible sentences in any order.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.',
  '[
    {"input": "s = \"catsanddog\", wordDict = [\"cat\",\"cats\",\"and\",\"sand\",\"dog\"]", "output": "[\"cats and dog\",\"cat sand dog\"]", "explanation": "Two valid segmentations exist."},
    {"input": "s = \"pineapplepenapple\", wordDict = [\"apple\",\"pen\",\"applepen\",\"pine\",\"pineapple\"]", "output": "[\"pine apple pen apple\",\"pineapple pen apple\",\"pine applepen apple\"]", "explanation": "Note that you are allowed to reuse dictionary words."},
    {"input": "s = \"catsandog\", wordDict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]", "output": "[]", "explanation": "No valid segmentation exists."}
  ]'::jsonb,
  ARRAY['1 <= s.length <= 20', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 10', 's and wordDict[i] consist of only lowercase English letters', 'All the strings of wordDict are unique', 'Input is generated such that the length of the answer list does not exceed 10^5'],
  true,
  '{
    "python3": "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> list[str]:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @param {string[]} wordDict\n * @return {string[]}\n */\nfunction wordBreak(s, wordDict) {\n\n}",
    "java": "class Solution {\n    public List<String> wordBreak(String s, List<String> wordDict) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<string> wordBreak(string s, vector<string>& wordDict) {\n\n    }\n};"
  }'::jsonb,
  'wordBreak',
  10
);

-- Note: for word break II, expected output arrays are sorted for comparison purposes.
-- The judge should sort both arrays before comparing.
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(27, '{"s": "catsanddog", "wordDict": ["cat","cats","and","sand","dog"]}', '["cat sand dog","cats and dog"]', true, 10, 1),
(27, '{"s": "pineapplepenapple", "wordDict": ["apple","pen","applepen","pine","pineapple"]}', '["pine apple pen apple","pine applepen apple","pineapple pen apple"]', true, 17, 2),
(27, '{"s": "catsandog", "wordDict": ["cats","dog","sand","and","cat"]}', '[]', true, 9, 3),
(27, '{"s": "a", "wordDict": ["a"]}', '["a"]', false, 1, 4),
(27, '{"s": "aaaa", "wordDict": ["a","aa"]}', '["a a a a","a a aa","a aa a","aa a a","aa aa"]', false, 4, 5),
(27, '{"s": "abcd", "wordDict": ["a","b","c","d","ab","cd","abc","bcd"]}', '["a b c d","a b cd","a bcd","ab c d","ab cd","abc d"]', false, 4, 6),
(27, '{"s": "leetcode", "wordDict": ["leet","code","lee","tcode"]}', '["lee tcode","leet code"]', false, 8, 7);

-- Large dictionary test case for problem 27
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
VALUES (27,
  '{"s": "aaaaaaaaaaaaaaaab", "wordDict": ["a","aa","aaa","aaaa","aaaaa","aaaaaa","aaaaaaa","aaaaaaaa"]}',
  '[]',
  false,
  1017,
  8);

-- ============================================================================
-- 28. Regular Expression Matching
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  28,
  'regular-expression-matching',
  'Regular Expression Matching',
  'hard',
  ARRAY['string', 'dynamic-programming', 'recursion'],
  E'Given an input string s and a pattern p, implement regular expression matching with support for ''.'' and ''*'' where:\n\n- ''.'' matches any single character.\n- ''*'' matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).\n\nReturn true if the pattern matches the entire string, false otherwise.',
  '[
    {"input": "s = \"aa\", p = \"a\"", "output": "false", "explanation": "\"a\" does not match the entire string \"aa\"."},
    {"input": "s = \"aa\", p = \"a*\"", "output": "true", "explanation": "''*'' means zero or more of the preceding element, ''a''. Therefore, by repeating ''a'' once, it becomes \"aa\"."},
    {"input": "s = \"ab\", p = \".*\"", "output": "true", "explanation": "\".*\" means zero or more of any character."}
  ]'::jsonb,
  ARRAY['1 <= s.length <= 20', '1 <= p.length <= 20', 's contains only lowercase English letters', 'p contains only lowercase English letters, ''.'', and ''*''', 'It is guaranteed for each appearance of ''*'', there will be a previous valid character to match'],
  true,
  '{
    "python3": "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        pass",
    "javascript": "/**\n * @param {string} s\n * @param {string} p\n * @return {boolean}\n */\nfunction isMatch(s, p) {\n\n}",
    "java": "class Solution {\n    public boolean isMatch(String s, String p) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isMatch(string s, string p) {\n\n    }\n};"
  }'::jsonb,
  'isMatch',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(28, '{"s": "aa", "p": "a"}', 'false', true, 2, 1),
(28, '{"s": "aa", "p": "a*"}', 'true', true, 2, 2),
(28, '{"s": "ab", "p": ".*"}', 'true', true, 2, 3),
(28, '{"s": "aab", "p": "c*a*b"}', 'true', false, 3, 4),
(28, '{"s": "mississippi", "p": "mis*is*ip*."}', 'true', false, 11, 5),
(28, '{"s": "ab", "p": ".*c"}', 'false', false, 2, 6),
(28, '{"s": "", "p": "a*b*c*"}', 'true', false, 0, 7);

-- Larger test for problem 28: long string with repeated pattern
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
VALUES (28,
  jsonb_build_object('s', repeat('a', 20), 'p', 'a*a*a*a*a*a*a*a*a*a*'),
  'true',
  false,
  1040,
  8);

-- ============================================================================
-- 29. Median of Two Sorted Arrays
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  29,
  'median-of-two-sorted-arrays',
  'Median of Two Sorted Arrays',
  'hard',
  ARRAY['array', 'binary-search', 'divide-and-conquer'],
  E'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log(m+n)).\n\nIf the combined array has an even number of elements, the median is the average of the two middle elements.',
  '[
    {"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0", "explanation": "Merged array = [1,2,3] and median is 2.0."},
    {"input": "nums1 = [1,2], nums2 = [3,4]", "output": "2.5", "explanation": "Merged array = [1,2,3,4] and median is (2+3)/2 = 2.5."}
  ]'::jsonb,
  ARRAY['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
  true,
  '{
    "python3": "class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        pass",
    "javascript": "/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nfunction findMedianSortedArrays(nums1, nums2) {\n\n}",
    "java": "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n\n    }\n};"
  }'::jsonb,
  'findMedianSortedArrays',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(29, '{"nums1": [1,3], "nums2": [2]}', '2.0', true, 3, 1),
(29, '{"nums1": [1,2], "nums2": [3,4]}', '2.5', true, 4, 2),
(29, '{"nums1": [], "nums2": [1]}', '1.0', true, 1, 3),
(29, '{"nums1": [2], "nums2": []}', '2.0', false, 1, 4),
(29, '{"nums1": [1,1,1], "nums2": [1,1,1]}', '1.0', false, 6, 5),
(29, '{"nums1": [1,2,3,4,5], "nums2": [6,7,8,9,10]}', '5.5', false, 10, 6),
(29, '{"nums1": [100000], "nums2": [-100000]}', '0.0', false, 2, 7);

-- Large test case for problem 29: two sorted arrays of 1000 elements each
-- nums1 = [0,2,4,...,1998], nums2 = [1,3,5,...,1999]
-- merged = [0,1,2,...,1999], median = (999+1000)/2 = 999.5
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
SELECT 29,
  jsonb_build_object(
    'nums1', (SELECT jsonb_agg(i * 2) FROM generate_series(0, 999) AS i),
    'nums2', (SELECT jsonb_agg(i * 2 + 1) FROM generate_series(0, 999) AS i)
  ),
  '999.5'::jsonb,
  false,
  2000,
  8;

-- ============================================================================
-- 30. Edit Distance
-- ============================================================================
INSERT INTO problems (id, slug, title, difficulty, tags, description, examples, constraints, active, starter_code, function_name, time_limit_seconds)
VALUES (
  30,
  'edit-distance',
  'Edit Distance',
  'hard',
  ARRAY['string', 'dynamic-programming'],
  E'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character\n\nThis is also known as the Levenshtein distance.',
  '[
    {"input": "word1 = \"horse\", word2 = \"ros\"", "output": "3", "explanation": "horse -> rorse (replace ''h'' with ''r'') -> rose (remove ''r'') -> ros (remove ''e'')"},
    {"input": "word1 = \"intention\", word2 = \"execution\"", "output": "5", "explanation": "intention -> inention (remove ''t'') -> enention (replace ''i'' with ''e'') -> exention (replace ''n'' with ''x'') -> exection (replace ''n'' with ''c'') -> execution (insert ''u'')"}
  ]'::jsonb,
  ARRAY['0 <= word1.length, word2.length <= 500', 'word1 and word2 consist of lowercase English letters'],
  true,
  '{
    "python3": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        pass",
    "javascript": "/**\n * @param {string} word1\n * @param {string} word2\n * @return {number}\n */\nfunction minDistance(word1, word2) {\n\n}",
    "java": "class Solution {\n    public int minDistance(String word1, String word2) {\n\n    }\n}",
    "cpp": "class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n\n    }\n};"
  }'::jsonb,
  'minDistance',
  10
);

INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order) VALUES
(30, '{"word1": "horse", "word2": "ros"}', '3', true, 8, 1),
(30, '{"word1": "intention", "word2": "execution"}', '5', true, 18, 2),
(30, '{"word1": "", "word2": ""}', '0', false, 0, 3),
(30, '{"word1": "", "word2": "abc"}', '3', false, 3, 4),
(30, '{"word1": "abc", "word2": ""}', '3', false, 3, 5),
(30, '{"word1": "abc", "word2": "abc"}', '0', false, 6, 6),
(30, '{"word1": "kitten", "word2": "sitting"}', '3', false, 13, 7);

-- Large test case for problem 30: two long strings
-- word1 = "abcabc..." (500 chars repeating "abc"), word2 = "xyzxyz..." (500 chars repeating "xyz")
-- edit distance = 500 (every character is different, all replacements)
INSERT INTO test_cases (problem_id, input, expected, is_sample, input_size, sort_order)
VALUES (30,
  jsonb_build_object(
    'word1', left(repeat('abc', 167), 500),
    'word2', left(repeat('xyz', 167), 500)
  ),
  '500',
  false,
  1000,
  8);

-- ─────────────────────────────────────────────────────────────────────────────
-- Reset sequences to avoid ID conflicts with future inserts
-- ─────────────────────────────────────────────────────────────────────────────
SELECT setval('problems_id_seq', (SELECT MAX(id) FROM problems));
SELECT setval('test_cases_id_seq', (SELECT MAX(id) FROM test_cases));
