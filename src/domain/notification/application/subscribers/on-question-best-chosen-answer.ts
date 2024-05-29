import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { QuestionBestChosenAnswerEvent } from '@/domain/forum/enterprise/events/question-best-chosen-answer-event'
import { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnQuestionBestChosenAnswer implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestChosenAnswerEvent.name,
    )
  }

  private async sendQuestionBestAnswerNotification({
    question,
    bestAnswerId,
  }: QuestionBestChosenAnswerEvent) {
    const answer = await this.answersRepository.findById(
      bestAnswerId.toString(),
    )

    if (answer) {
      await this.sendNotification.execute({
        recipientId: answer.authorId.toString(),
        title: `Your answer has been chosen!`,
        content: `The answer you sent in "${question.title
          .substring(0, 20)
          .concat('...')}" was chosen it's author.`,
      })
    }
  }
}
