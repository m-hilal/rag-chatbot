import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  role: 'user' | 'assistant';

  @ManyToOne(() => ChatSession, session => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column()
  sessionId: string;

  @CreateDateColumn()
  createdAt: Date;

  // New field to store retrieved context as a JSON string
  @Column({ type: 'text', nullable: true })
  retrievedContextJson?: string;
} 