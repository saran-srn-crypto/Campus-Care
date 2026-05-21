import React from 'react';
import Timeline from '../common/Timeline';

export default function TicketTimeline({ items }) {
  return (
    <section>
      <h3 className="m-0 mb-2 font-bold">Timeline</h3>
      <Timeline items={items} />
    </section>
  );
}
