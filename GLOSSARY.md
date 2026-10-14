# Regex Generator and Tester

A tool for describing text patterns, generating regular expressions, and checking their behavior against examples.

## Language

**Pattern**:
A regular expression describing text to find or validate.
_Avoid_: Rule, formula

**Preset**:
A prebuilt pattern for a common text format that users can select as a starting point.
_Avoid_: Template

**Test text**:
Text checked against a pattern to inspect its matches.
_Avoid_: Prompt, description

**Description**:
A user's plain-language statement of what a generated pattern should match.
_Avoid_: Test text

**Match**:
A portion of test text selected by a pattern.

**Capture group**:
A named or numbered part of a pattern that extracts a value from a match.

**Explanation**:
A plain-language account of what a pattern and its parts mean.

**Example check**:
A sample input paired with whether it should match the current pattern. Its result shows whether the pattern behaves as expected for that sample.
_Avoid_: Playground text, description

**Matching intent**:
The choice between finding portions of text and requiring the entire input to match a pattern.
_Avoid_: Regex dialect
