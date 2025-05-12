import { PrimaryGeneratedColumn } from 'typeorm';

export class AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;
}