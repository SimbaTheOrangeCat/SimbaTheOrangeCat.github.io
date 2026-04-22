**FREE
ctl-opt dftactgrp(*no) actgrp(*caller) option(*srcstmt:*nodebugio);

dcl-pi *n char(16);
  pEmail varchar(254) const;
  pSource varchar(64) const;
end-pi;

dcl-s emailNorm varchar(254);
dcl-s resultCode char(16) inz('ERROR');

exec sql
  set option naming = *sys, commit = *none, datfmt = *iso;

emailNorm = %xlate('ABCDEFGHIJKLMNOPQRSTUVWXYZ':
                   'abcdefghijklmnopqrstuvwxyz':
                   %trim(pEmail));

exec sql
  merge into YOURLIB/NEWSLETTER_SUBS as T
  using (values(:pEmail, :emailNorm, :pSource)) as S(EMAIL, EMAIL_NORM, SOURCE)
    on T.EMAIL_NORM = S.EMAIL_NORM
  when matched then
    update set EMAIL = S.EMAIL,
               SOURCE = S.SOURCE,
               STATUS = 'A',
               UPDATED_AT = current timestamp
  when not matched then
    insert (EMAIL, EMAIL_NORM, STATUS, SOURCE, CREATED_AT, UPDATED_AT)
    values (S.EMAIL, S.EMAIL_NORM, 'A', S.SOURCE, current timestamp, current timestamp);

if sqlcode = 0;
  exec sql
    select case
             when CREATED_AT = UPDATED_AT then 'SUBSCRIBED'
             else 'ALREADY_SUB'
           end
      into :resultCode
      from YOURLIB/NEWSLETTER_SUBS
     where EMAIL_NORM = :emailNorm
     fetch first 1 row only;
endif;

return resultCode;
