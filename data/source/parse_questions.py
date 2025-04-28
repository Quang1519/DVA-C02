import re
import json

def parse_questions(text):
    questions = []
    # Split by QUESTION
    q_blocks = re.split(r'QUESTION (\d+)', text)
    for i in range(1, len(q_blocks), 2):
        qid = int(q_blocks[i])
        block = q_blocks[i+1].strip()
        # Extract question
        q_match = re.search(r'^(.*?)([A-E]\.)', block, re.DOTALL)
        if not q_match:
            continue
        q_text = q_match.group(1).replace('\n', ' ').strip()
        # Extract options
        options = []
        opt_matches = re.findall(r'([A-E])\. (.*?)(?=(?:[A-E]\. )|(?:Answer:))', block, re.DOTALL)
        for idx, (opt_letter, opt_text) in enumerate(opt_matches, 1):
            options.append({
                "id": idx,
                "text": opt_text.replace('\n', ' ').strip(),
                "image": ""
            })
        # Extract answer
        ans_match = re.search(r'Answer: ([A-E](?:, ?[A-E])*)', block)
        if ans_match:
            ans_letters = [a.strip() for a in ans_match.group(1).split(',')]
            ans_ids = [ord(a)-ord('A')+1 for a in ans_letters]
        else:
            ans_ids = []
        # Extract explanation
        exp_match = re.search(r'Explanation:\s*(.*?)(?:Reference:|\Z)', block, re.DOTALL)
        explanation = exp_match.group(1).replace('\n', ' ').strip() if exp_match else ""
        # Extract reference
        ref_match = re.search(r'Reference:\s*(.*)', block, re.DOTALL)
        reference = ref_match.group(1).replace('\n', ' ').strip() if ref_match else ""
        # Compose question dict
        questions.append({
            "id": qid,
            "question": q_text,
            "options": options,
            "image": "",
            "correctAnswer": {"id": ans_ids},
            "explaination": explanation,
            "reference": reference
        })
    return questions

def main():
    # Read text from file
    with open('pdf_content.txt', 'r', encoding='utf-8') as f:
        raw_text = f.read()
    questions_json = {"questions": parse_questions(raw_text)}
    # Pretty print as JSON
    print(json.dumps(questions_json, indent=2))
    with open('questions.json', 'w', encoding='utf-8') as outfile:
        json.dump(questions_json, outfile, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
