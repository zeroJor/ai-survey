import type { ReactNode } from 'react';
import { RichText } from '@/components/RichText';
import type { InterviewReview, InterviewReviewQuestion } from '@/admin/types';

function ChatBubble({
    align,
    label,
    children,
    variant = 'default',
}: {
    align: 'left' | 'right';
    label: string;
    children: ReactNode;
    variant?: 'default' | 'micro';
}) {
    const isLeft = align === 'left';
    const isMicro = variant === 'micro';

    return (
        <div
            className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
        >
            <span
                className={`mb-1 px-1 text-[11px] font-medium uppercase tracking-wide ${
                    isLeft ? 'text-[#0077FF]' : 'text-gray-500'
                } ${isLeft ? 'text-left' : 'text-right'}`}
            >
                {label}
            </span>
            <div
                className={[
                    'relative max-w-[min(100%,28rem)] px-3 py-2 text-[15px] leading-snug',
                    isMicro ? 'text-sm' : '',
                    isLeft
                        ? isMicro
                          ? 'rounded-2xl rounded-tl-md border border-[#0077FF]/15 bg-[#0077FF]/5 text-gray-800'
                          : 'rounded-2xl rounded-tl-md border border-gray-200 bg-white text-[#1A1A1A]'
                        : 'rounded-2xl rounded-tr-md border border-[#0077FF]/20 bg-[#0077FF]/10 text-[#1A1A1A]',
                ].join(' ')}
            >
                {children}
            </div>
        </div>
    );
}

function QuestionTurn({
    question,
    clientLabel,
}: {
    question: InterviewReviewQuestion;
    clientLabel: string;
}) {
    const prompt = question.labelNeutral || question.code;
    const answer = question.answer;
    if (answer === null) {
        return null;
    }

    const answerText = answer.skipped
        ? '(Prefiere no contestar)'
        : (answer.body ?? '');

    return (
        <li className="flex flex-col gap-2">
            <ChatBubble align="left" label="Lisa">
                <RichText text={prompt} as="span" className="whitespace-pre-wrap" />
            </ChatBubble>

            <ChatBubble align="right" label={clientLabel}>
                <p
                    className={`whitespace-pre-wrap ${
                        answer.skipped ? 'italic text-gray-600' : ''
                    }`}
                >
                    {answerText}
                </p>
            </ChatBubble>

            {question.microReply && (
                <ChatBubble align="left" label="Lisa" variant="micro">
                    <p className="whitespace-pre-wrap">{question.microReply.text}</p>
                </ChatBubble>
            )}
        </li>
    );
}

interface Props {
    review: InterviewReview;
}

export function InterviewChatThread({ review }: Props) {
    const clientLabel =
        review.invite.contactName?.trim() || 'Cliente';

    const answered = review.questions.filter((q) => q.answer !== null);

    if (answered.length === 0 && !review.farewell) {
        return (
            <p className="mt-2 text-sm text-gray-600">
                Aún no hay respuestas en esta entrevista.
            </p>
        );
    }

    return (
        <ul className="mt-4 flex flex-col gap-6">
            {answered.map((q) => (
                <QuestionTurn
                    key={q.code}
                    question={q}
                    clientLabel={clientLabel}
                />
            ))}

            {review.farewell && (
                <li>
                    <ChatBubble align="left" label="Lisa">
                        <p className="whitespace-pre-wrap">
                            {review.farewell.content}
                        </p>
                    </ChatBubble>
                </li>
            )}
        </ul>
    );
}
