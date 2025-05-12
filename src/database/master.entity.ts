import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';

export class MasterEntity extends AuditableEntity {
  @DeleteDateColumn({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy?: number;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt?: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

}