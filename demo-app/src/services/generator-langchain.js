import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const DEFAULT_MODEL = process.env.LANGCHAIN_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = Number(process.env.OPENAI_TEMPERATURE || 0);

const TestCaseSchema = z.object({
  title: z.string(),
  steps: z.array(z.string()).min(1),
  expected_result: z.string(),
  risk: z.string()
});

const TestPlanSchema = z.object({
  cases: z.array(TestCaseSchema).min(1).max(5),
  note: z.string().optional()
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'You are a QA assistant that generates concise, high-quality test cases. Use only the supplied task and context. If details are missing, keep the risk field explicit. Return structured output.'
  ],
  [
    'human',
    [
      'Generate 3-5 test cases for the following task.',
      'Task: {task}',
      'Context: {context}'
    ].join('\n')
  ]
]);

export async function generateTestPlanLangChain({ task, context }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      model: DEFAULT_MODEL,
      mode: 'provider-required',
      engine: 'langchain',
      completion: {
        note: 'LangChain v2 requires OPENAI_API_KEY. Use the manual engine for offline mock mode.',
        reason: 'provider_required'
      }
    };
  }

  const llm = new ChatOpenAI({
    model: DEFAULT_MODEL,
    temperature: DEFAULT_TEMPERATURE
  });

  const structuredLlm = llm.withStructuredOutput(TestPlanSchema, {
    name: 'qa_test_plan'
  });

  const chain = prompt.pipe(structuredLlm);
  const completion = await chain.invoke({
    task,
    context: context || 'None provided'
  });

  return {
    model: DEFAULT_MODEL,
    mode: 'provider',
    engine: 'langchain',
    completion
  };
}
